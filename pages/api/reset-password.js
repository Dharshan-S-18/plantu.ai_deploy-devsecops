// pages/api/reset-password.js
import dbConnect from '../../utils/dbConnect'; // Ensure the path is correct
import OrgAccount from '../../models/orgAccount';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  await dbConnect();

  const user = await OrgAccount.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  const existingUser = user;

  if (!existingUser) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  existingUser.password = hashedPassword;
  existingUser.resetToken = undefined;
  existingUser.resetTokenExpiry = undefined;
  await existingUser.save();

  return res.status(200).json({ message: 'Password reset successfully' });
}
