// pages/api/workspace/[workspaceId]/project/[projectId]/task/[taskId]/subtask/[subtaskId].js
import dbConnect from '../../../../../../../../../../lib/dbConnect';
import Workspace from '../../../../../../../../../../models/workSpace'; // Assuming workspace schema contains projects and tasks

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id, taskId, subtaskId } = req.query; // Extract workspaceId, projectId, taskId, and subtaskId from query parameters

  await dbConnect();
  console.log(`workspaceId: ${workspaceId}, projectId: ${id}, taskId: ${taskId}, subtaskId: ${subtaskId}`);

  switch (method) {
    case 'PUT':
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

        // Find the subtask by ID within the task's subtasks array
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) {
          return res.status(404).json({ success: false, error: 'Subtask not found' });
        }

        // Update the subtask fields
        subtask.name = name || subtask.name;
        subtask.assignee = assignee || subtask.assignee;
        subtask.dueDate = dueDate || subtask.dueDate;
        subtask.priority = priority || subtask.priority;
        subtask.status = status || subtask.status;
        subtask.comments = comments || subtask.comments;
        subtask.checklist = checklist || subtask.checklist;
        subtask.allocatedEffort = allocatedEffort || subtask.allocatedEffort;
        subtask.actualEffort = actualEffort || subtask.actualEffort;
        subtask.description = description || subtask.description;

        // Save the workspace with the updated subtask
        await workspace.save();

        res.status(200).json({ success: true, subtask });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
