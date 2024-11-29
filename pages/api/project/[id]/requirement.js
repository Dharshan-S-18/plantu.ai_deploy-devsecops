// pages/api/projects/[id]/tasks.js
import dbConnect from '../../../../lib/dbConnect';
import Project from '../../../../models/project';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  console.log(req.query);
  console.log(req.body);

  await dbConnect();

  if (method === 'POST') {
    try {
      const { requirementNo, description, shortDescription, assignedTo, createdBy, createdDate, status  } = req.body;
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const newRequirement = { requirementNo, description, shortDescription, assignedTo, createdBy, createdDate, status  };
      project.requirements.push(newRequirement);
      console.log(newRequirement);
      await project.save();

      res.status(201).json({ success: true, Raid: newRequirement });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (method === 'GET') {
    try {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      res.status(200).json({ success: true, requirements: project.requirements });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

//pages/api/projects/[projectId]/tasks/[taskId].js
