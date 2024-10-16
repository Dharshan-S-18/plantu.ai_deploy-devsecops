// pages/api/workspace/[workspaceId]/project/[projectId]/task/[taskId]/comments.js

import dbConnect from '../../../../../../../../../lib/dbConnect';
import Workspace from '../../../../../../../../../models/workSpace';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id, taskId } = req.query; // Extract workspaceId, projectId, and taskId from query parameters

  await dbConnect();

  // Validate ObjectId format for workspaceId, projectId, and taskId
  if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ success: false, error: 'Invalid workspaceId, projectId, or taskId format' });
  }

  switch (method) {
    case 'GET':
      try {
        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Find the project within the workspace by projectId
        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found in this workspace' });
        }

        // Find the task within the project's tasks array by taskId
        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Return the comments of the task
        res.status(200).json({ success: true, comments: task.comments || [] });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { text, user } = req.body;

        // Validate that both 'text' and 'user' are provided
        if (!text || !user) {
          return res.status(400).json({ success: false, error: 'Text and user are required' });
        }

        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Find the project within the workspace by projectId
        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found in this workspace' });
        }

        // Find the task within the project's tasks array by taskId
        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Create a new comment object
        const newComment = {
          text,
          user,
          timestamp: new Date(), // Properly formatted date
        };

        // Check if the task's comments field is initialized and is an array
        if (!Array.isArray(task.comments)) {
          task.comments = []; // Initialize as an empty array if not already an array
        }

        // Add the new comment to the task's comments array
        task.comments.push(newComment);

        // Save the updated workspace document
        await workspace.save();

        // Return the updated comments array
        res.status(200).json({ success: true, comments: task.comments });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
