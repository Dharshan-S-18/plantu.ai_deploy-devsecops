// pages/api/workspace/index.js

import dbConnect from '../../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import WorkSpace from '../../../models/workSpace'; // Adjust the path to your WorkSpace model

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        // Create a new workspace
        const workspace = await WorkSpace.create(req.body);
        res.status(201).json({ success: true, data: workspace });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'GET':
      try {
        // Fetch all workspaces
        const { accountId } = req.query;
        const workspaces = await WorkSpace.find({ accountId }).populate('projects');
        res.status(200).json({ success: true, data: workspaces });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
