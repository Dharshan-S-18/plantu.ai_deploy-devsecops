// pages/api/projects/[projectId]/tasks/[taskId]/subtasks/[subtaskId].js
import dbConnect from '../../../../../../../../lib/dbConnect';
import Project from '../../../../../../../../models/taskProject';

export default async function handler(req, res) {
  const { method } = req;
  const { id, taskId, subtaskId } = req.query;

  await dbConnect();
  console.log(`projectId: ${id}, taskId: ${taskId}, subtaskId: ${subtaskId}`);

  if (method === 'PUT') {
    try {
      const { name, assignee, dueDate, priority, status, comments } = req.body;

      // Find the project by ID
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Find the task by ID within the project's tasks
      const task = project.tasks.id(taskId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      // Find the subtask by ID within the task's subtasks
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

      // Save the project with the updated task and subtask
      await project.save();

      res.status(200).json({ success: true, subtask });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
