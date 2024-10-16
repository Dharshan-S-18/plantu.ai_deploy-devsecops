// pages/api/projects/[projectId]/comments.js

import dbConnect from '../../../../lib/dbConnect';
import Project from '../../../../models/project';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Use projectId as the correct parameter

  console.log('Received projectId:', id); // Log the received projectId

  // Connect to the database
  await dbConnect();

  // Validate the projectId to ensure it's a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid projectId format' });
  }

  switch (method) {
    case 'GET':
      try {
        // Find the project by its ObjectId using the 'new' keyword
        const project = await Project.findById(new mongoose.Types.ObjectId(id));

        if (!project) {
          console.log('Project not found for ID:', id);
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Return the project's comments
        res.status(200).json({ success: true, comments: project.comments });
      } catch (error) {
        console.error('Error fetching project:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST': // Using POST for adding a new comment
      try {
        const { text, user } = req.body;

        if (!text || !user) {
          return res.status(400).json({ success: false, error: 'Text and user are required' });
        }
        console.log('Received comment data:', req.body);

        // Find the project by ObjectId using the 'new' keyword
        const project = await Project.findById(new mongoose.Types.ObjectId(id));

        if (!project) {
          console.log('Project not found for ID:', id);
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Add the new comment to the project's comments array
        const newComment = { text, user, timestamp: new Date() };
        project.comments.push(newComment);

        // Save the updated project document
        await project.save();

        res.status(200).json({ success: true, comments: project.comments });
      } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
