// pages/api/workspace/[workspaceId]/project/[projectId]/task/[taskId]/subtasks.js
import dbConnect from '../../../../../../../../../lib/dbConnect';
import Workspace from '../../../../../../../../../models/workSpace'; // Assuming the workspace schema contains projects and tasks

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id, taskId } = req.query; // Extract workspaceId, projectId, and taskId from query parameters
  console.log(req.query);

  await dbConnect();

  console.log(`workspaceId: ${workspaceId}, projectId: ${id}, taskId: ${taskId}`);

  switch (method) {
    case 'POST':
      try {
        const { name, description, assignee, dueDate, priority, status, comments, checklist, allocatedEffort, actualEffort } = req.body;

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

        // Find the task by ID within the project's tasks array
        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Create new subtask and add to the task's subtasks array
        const newSubtask = { name, description, assignee, dueDate, priority, status, comments, checklist, allocatedEffort, actualEffort  };
        task.subtasks.push(newSubtask);

        // Save the updated workspace document
        await workspace.save();

        res.status(201).json({ success: true, subtask: newSubtask });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

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

        // Find the task by ID within the project's tasks array
        const task = project.tasks.id(taskId);
        if (!task) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Respond with the subtasks of the found task
        res.status(200).json({ success: true, subtasks: task.subtasks });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
