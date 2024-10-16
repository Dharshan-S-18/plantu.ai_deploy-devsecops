// pages/api/forget-password.js
import dbConnect from '../../utils/dbConnect'; // Ensure the path is correct
import OrgAccount from '../../models/orgAccount';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { sub } from 'date-fns';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { email, subdomain, portNumber } = req.body;

  if (!subdomain || !email) {
    return res.status(400).json({ error: 'Subdomain and email are required' });
  }

  await dbConnect();

  const user = await OrgAccount.findOne({ email, subdomainName: subdomain });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingUser = user;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes in milliseconds

  existingUser.resetToken = token;
  existingUser.resetTokenExpiry = tokenExpiry;
  await existingUser.save();

  // Construct the login URL with the subdomain
  const loginUrl = process.env.NODE_ENV === 'development' ? `http://${subdomain}.${process.env.NEXT_PUBLIC_URL}:${portNumber}` : `https://${subdomain}.${process.env.NEXT_PUBLIC_URL}`;

  const resetUrl = `${loginUrl}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: existingUser.email,
    from: process.env.EMAIL_USERNAME,
    subject: 'Password Reset',
    html: `
    <p>Please click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({ message: 'Password reset email sent' });
}
