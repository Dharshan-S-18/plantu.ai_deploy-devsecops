// pages/api/projects/[id]/tasks.js
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/taskProject';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { name, assigneePrimary, startDate, dueDate, taskNumber, priority,  comments, dependency, description, allocatedEffort, actualEffort, checklist, status  } = req.body;
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const newTask = { name, assigneePrimary, startDate, dueDate, taskNumber, priority, comments, dependency, description, allocatedEffort, actualEffort, checklist, status  };
      project.tasks.push(newTask);
      await project.save();

      res.status(201).json({ success: true, task: newTask });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      res.status(200).json({ success: true, tasks: project.tasks });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

//pages/api/projects/[projectId]/tasks/[taskId].js
