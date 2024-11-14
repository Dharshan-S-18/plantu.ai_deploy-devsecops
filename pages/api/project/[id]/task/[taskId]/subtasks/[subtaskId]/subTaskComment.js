// pages/api/workspace/[workspaceId]/project/[projectId]/task/[taskId]/subtask/[subtaskId]/comments.js

import dbConnect from '../../../../../../../../lib/dbConnect';
import Project from '../../../../../../../../models/project';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { method } = req;
  const { id, taskId, subtaskId } = req.query;
  console.log(req.query);

  await dbConnect();

  // Validate that all IDs are properly formatted MongoDB ObjectIds
  if (
    // !mongoose.Types.ObjectId.isValid(workspaceId) ||
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(taskId) ||
    !mongoose.Types.ObjectId.isValid(subtaskId)
  ) {
    return res.status(400).json({ success: false, error: 'Invalid workspaceId, projectId, taskId, or subtaskId format' });
  }

  switch (method) {
    case 'GET':
      try {
        // Find the workspace
        // const workspace = await Workspace.findById(workspaceId);
        // if (!workspace) {
        //   return res.status(404).json({ success: false, error: 'Workspace not found' });
        // }

        // Navigate through the hierarchy: workspace → project → task → subtask
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        const task = project.tasks.id(taskId);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) return res.status(404).json({ success: false, error: 'Subtask not found' });

        // Return the comments array from the subtask
        res.status(200).json({ success: true, comments: subtask.comments || [] });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

      case 'POST':
    try {
        const { text, user } = req.body;

        // Check that both 'text' and 'user' are provided and are non-empty
        if (!text || !user) {
            return res.status(400).json({ success: false, error: 'Text and user fields are required' });
        }

        // Fetch the project document
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

        // Find the task within the project
        const task = project.tasks.id(taskId);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

        // Find the subtask within the task
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) return res.status(404).json({ success: false, error: 'Subtask not found' });

        // Ensure comments is an array
        if (!Array.isArray(subtask.comments)) {
            subtask.comments = [];
        }

        // Create and push new comment with required fields
        const newComment = { text, user, timestamp: new Date() };
        subtask.comments.push(newComment);

        // Save the updated Project document
        await project.save();

        res.status(200).json({ success: true, comments: subtask.comments });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
    break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
