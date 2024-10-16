// pages/api/projects/[projectId]/tasks/[taskId]/subtasks.js
import dbConnect from '../../../../../../../lib/dbConnect';
import Project from '../../../../../../../models/taskProject';

export default async function handler(req, res) {
  const { method } = req;
  const { id, taskId } = req.query;

  await dbConnect();
  console.log(`projectId: ${id}, taskId: ${taskId}`);

  if (method === 'POST') {
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

      // Create new subtask and add to the task's subtasks array
      const newSubtask = { name, assignee, dueDate, priority, status, comments };
      task.subtasks.push(newSubtask);

      // Save the project with the updated task
      await project.save();

      res.status(201).json({ success: true, subtask: newSubtask });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
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

      // Respond with the subtasks of the found task
      res.status(200).json({ success: true, subtasks: task.subtasks });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
