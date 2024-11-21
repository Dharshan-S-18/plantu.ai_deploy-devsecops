import dbConnect from '../../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import Requirement from '../../../models/directRequirement'; // Adjust the path to your Requirement model
import mongoose from 'mongoose'; // Import mongoose to validate ObjectId

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      // Destructure the body to extract Requirement data
      const { requirementNo, description, shortDescription, assignedTo, status, projectId, createdBy, createdDate } = req.body;

      // Validate projectId to ensure it's a valid ObjectId if present
      let validProjectId = null;
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        validProjectId = projectId; // Use the valid projectId
      } else if (!projectId) {
        // If projectId is not provided, it will be null (No project)
        validProjectId = null;
      }

      // Prepare the Requirement data
      const requirementData = {
        requirementNo, description, shortDescription, assignedTo, status, projectId: validProjectId, createdBy, createdDate };

      // Create the new Requirement
      const newRequirement = await Requirement.create(requirementData);
      res.status(201).json({ success: true, Requirement: newRequirement });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const { projectId } = req.query;

      // If projectId is provided and is a valid ObjectId, fetch requirements for that specific project
      if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
        const requirements = await Requirement.find({ projectId });
        res.status(200).json({ success: true, requirements });
      } else {
        // Otherwise, fetch all requirements globally
        const requirements = await Requirement.find();
        res.status(200).json({ success: true, requirements });
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
