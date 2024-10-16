// pages/api/auth/removeAgent.js 

import dbConnect from '../../../utils/dbConnect';
import OrgAccount from '../../../models/orgAccount';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  // Handle the deletion of an agent
  if (req.method === 'DELETE') {
    try {
      const agent = await OrgAccount.findById(id);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      await OrgAccount.deleteOne({ _id: id });

      res.status(200).json({ message: 'Agent deleted successfully' });
    } catch (error) {
      console.error('Error deleting agent:', error);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  }
  // Handle updating the role of a user
  else if (req.method === 'PUT') {

    const { role } = req.body;

    if (!role || (role !== 'User' && role !== 'Admin')) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    try {
      const agent = await OrgAccount.findById(id);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      agent.role = role; // Update the role
      await agent.save(); // Save the changes

      res.status(200).json({ message: `Agent role updated to ${role} successfully` });
    } catch (error) {
      console.error('Error updating agent role:', error);
      res.status(500).json({ error: 'Failed to update agent role' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
