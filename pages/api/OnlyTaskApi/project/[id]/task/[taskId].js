// pages/api/project/[id]/task/[taskId].js
import dbConnect from '../../../../../../lib/dbConnect';
import Project from '../../../../../../models/taskProject';

export default async function handler(req, res) {
  console.log(req.query.id);
  const { method } = req;
  const { id, taskId } = req.query;

  await dbConnect();

  console.log(`Received project id: ${id}, taskId: ${taskId}`); // Log received IDs

  if (!id || !taskId) {
    console.error('Project ID or Task ID is missing');
    return res.status(400).json({ success: false, message: 'Project ID or Task ID is missing' });
  }

  switch (method) {
    case 'PUT':
      try {
        // Find the project by ID
        const project = await Project.findById(id);

        if (!project) {
          console.error('Project not found');
          return res.status(404).json({ success: false, message: 'Project not found' });
        }

        console.log('Project found:', project);

        // Find the task within the project's tasks array by taskId
        const task = project.tasks.id(taskId);

        if (!task) {
          console.error(`Task with ID ${taskId} not found in project ${id}`);
          return res.status(404).json({ success: false, message: 'Task not found' });
        }

        console.log('Task found:', task);

        // Update the task fields
        task.name = req.body.name || task.name;
        task.assigneePrimary = req.body.assigneePrimary || task.assigneePrimary;
        task.startDate = req.body.startDate || task.startDate;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.priority = req.body.priority || task.priority;
        task.dependency = req.body.dependency || task.dependency;
        task.comments = req.body.comments || task.comments;
        task.checklist = req.body.checklist || task.checklist;
        task.allocatedEffort = req.body.allocatedEffort || task.allocatedEffort;
        task.description = req.body.description || task.description;
        task.actualEffort = req.body.actualEffort || task.actualEffort;
        task.status = req.body.status || task.status;


        // name: '',
        // assigneePrimary: '',
        // assigneeSecondary: '',
        // dueDate: '',
        // priority: '',
        // dependency: '',  
        // comments: '',   
        // description: '',   
        // checklist: [],
        // allocatedEffort: '',
        // actualEffort: '',


        // Save the updated project
        await project.save();

        return res.status(200).json({ success: true, task });
      } catch (error) {
        console.error('Error during task update:', error.message);
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
