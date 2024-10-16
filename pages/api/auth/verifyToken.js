// pages/api/auth/verifyToken.js

import dbConnect from '../../../utils/dbConnect';
import OrgAccount from '../../../models/orgAccount';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required.' });
  }

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

    // Check if the token matches the one stored in the database
    if (agent.passwordToken !== token) {
      return res.status(401).json({ error: 'Invalid or expired token. Please request a new link.' });
    }

    // Token is valid
    console.log("Token is valid");
    return res.status(200).json({ message: 'Token is valid', userId: agent._id });
  } catch (err) {
    console.error('Error verifying token:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please request a new link.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please request a new link.' });
    } else {
      return res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}