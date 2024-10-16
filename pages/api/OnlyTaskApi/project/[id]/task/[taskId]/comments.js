// pages/api/project/[projectId]/task/[taskId]/comments.js

import dbConnect from '../../../../../../../lib/dbConnect';
import Project from '../../../../../../../models/taskProject';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;
  const { id, taskId } = req.query;

  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ success: false, error: 'Invalid id or taskId format' });
  }

  switch (method) {
    case 'GET':
      try {
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

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

        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Create a properly structured new comment object
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

        await project.save();
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
