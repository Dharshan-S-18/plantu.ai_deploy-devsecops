// pages/api/setPassword.js
 
import dbConnect from '../../utils/dbConnect';
import OrgAccount from '../../models/orgAccount';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
 
  const { token, password } = req.body;
 
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, subdomainName } = decoded;
 
    // Connect to the database
    await dbConnect();
 
    // Check if the agent exists
    const agent = await OrgAccount.findOne({ email, subdomainName });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }
 
    if (agent.passwordToken !== token) {
        return res.status(409).json({ error: 'Token is used or expired. Please ask admin to send email again.' });
    }
 
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Update the agent's password in the database
    agent.password = hashedPassword;
    agent.passwordToken = undefined;
    await agent.save();
 
    res.status(200).json({ message: 'Password set successfully.' });
  } catch (error) {
    console.error('Error verifying token or setting password:', error);
 
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token has expired. Please request a new one.' });
    }
 
    return res.status(500).json({ error: 'Failed to set password. Please try again.' });
  }
}