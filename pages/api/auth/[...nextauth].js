import NextAuth from "next-auth";
import dbConnect from '../../../utils/dbConnect';
import OrgAccount from '../../../models/orgAccount';
import bcrypt from 'bcryptjs';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { subdomain, email, password } = credentials;
        // console.log( subdomain, email, password );
        await dbConnect();

        try {
          const user = await OrgAccount.findOne({ email, subdomainName: subdomain });
          if (!user) {
            console.log("Account doesn't exist with provided email.");
            throw new Error("Account doesn't exist with provided email.");
          }

          if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              // console.log("Password does not match");
              throw new Error("Password does not match");
            }
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountId: user.accountId,
            organizationName: user.organizationName
          };
        } catch (error) {
          // console.error("Error during authentication:", error);
          throw new Error(error.message);
        }
      }
    })
  ],
  session: {
    maxAge: 15 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountId = user.accountId;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role; 
        session.user.accountId = token.accountId;
        session.user.organizationName = token.organizationName;
      }
      return session;
    }
  }
});