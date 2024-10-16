// pages/_app.js
import { SessionProvider, useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
 
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {Component.auth ? (
        // If the Component requires authentication, wrap it with the Auth component
        <Auth>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Auth>
      ) : (
        // Otherwise, render the Component without Layout
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}
 
function Auth({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
 
  // While loading the session, show nothing or a loading spinner
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
 
  // If no session exists, redirect to login page
  if (!session) {
    router.push('/login');
    return null;
  }
 
  // Otherwise, show the children (the protected page with Layout)
  return children;
}
 
export default MyApp;
 
