import dbConnect from '../../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import Raid from '../../../models/directRaid'; // Adjust the path to your Raid model
import mongoose from 'mongoose'; // Import mongoose to validate ObjectId

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      // Destructure the body to extract Raid data
      const { raidId, description, assignedTo, type, date, status, projectId, createdBy, createdDate } = req.body;

      // Validate projectId to ensure it's a valid ObjectId if present
      let validProjectId = null;
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        validProjectId = projectId; // Use the valid projectId
      } else if (!projectId) {
        // If projectId is not provided, it will be null (No project)
        validProjectId = null;
      }

      // Prepare the Raid data
      const raidData = {
        raidId, description, assignedTo, type, date, status, projectId: validProjectId, createdBy, createdDate };

      // Create the new Raid
      const newRaid = await Raid.create(raidData);
      res.status(201).json({ success: true, Raid: newRaid });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const { projectId } = req.query;

      // If projectId is provided and is a valid ObjectId, fetch raids for that specific project
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        const raids = await Raid.find({ projectId });
        res.status(200).json({ success: true, raids });
      } else {
        // Otherwise, fetch all raids globally
        const raids = await Raid.find();
        res.status(200).json({ success: true, raids });
      }
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
