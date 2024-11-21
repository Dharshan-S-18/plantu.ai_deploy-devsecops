import dbConnect from '../../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import Stakeholder from '../../../models/directStakeholder'; // Adjust the path to your Stakeholder model
import mongoose from 'mongoose'; // Import mongoose to validate ObjectId

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      // Destructure the body to extract stakeholder data
      const { name, email, contact, type, role, projectId, createdBy, createdDate } = req.body;

      // Validate projectId to ensure it's a valid ObjectId if present
      let validProjectId = null;
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        validProjectId = projectId; // Use the valid projectId
      } else if (!projectId) {
        // If projectId is not provided, it will be null (No project)
        validProjectId = null;
      }

      // Prepare the stakeholder data
      const stakeholderData = {
        name,
        email,
        contact,
        type,
        role,
        projectId: validProjectId, // Use the valid projectId or null
        createdBy,
        createdDate,
      };

      // Create the new stakeholder
      const newStakeholder = await Stakeholder.create(stakeholderData);
      res.status(201).json({ success: true, stakeholder: newStakeholder });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const { projectId } = req.query;

      // If projectId is provided and is a valid ObjectId, fetch stakeholders for that specific project
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        const stakeholders = await Stakeholder.find({ projectId });
        res.status(200).json({ success: true, stakeholders });
      } else {
        // Otherwise, fetch all stakeholders globally
        const stakeholders = await Stakeholder.find();
        res.status(200).json({ success: true, stakeholders });
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
