// pages/api/projects/[projectId]/tasks/[taskId].js
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/project';

export default async function handler(req, res) {
  const { method } = req;
  const { id, stakeholdersId } = req.query;
  console.log(req.query);
  console.log(id, stakeholdersId);

  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        const { name, email, contact, type, role, createdBy, createdDate  } = req.body;

        // Find the project by ID
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Find the stakeholder by stakeholdersId
        const stakeholder = project.stakeholders.id(stakeholdersId);
        console.log(stakeholder);
        if (!stakeholder) {
          return res.status(404).json({ success: false, error: 'Stakeholder not found' });
        }

        // Update the stakeholder fields
        stakeholder.name = name || stakeholder.name;
        stakeholder.email = email || stakeholder.email;
        stakeholder.contact = contact || stakeholder.contact;
        stakeholder.type = type || stakeholder.type;
        stakeholder.role = role || stakeholder.role;
        stakeholder.createdBy = createdBy || stakeholder.createdBy;
        stakeholder.createdDate = createdDate || stakeholder.createdDate;

        // Save the updated project
        await project.save();

        res.status(200).json({ success: true, stakeholder });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        // Find the project by ID
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Find the stakeholder by stakeholdersId
        const stakeholder = project.stakeholders.id(stakeholdersId);
        if (!stakeholder) {
          return res.status(404).json({ success: false, error: 'Stakeholder not found' });
        }

        // Remove the stakeholder from the array
        project.stakeholders = project.stakeholders.filter(
          (stakeholder) => stakeholder._id.toString() !== stakeholdersId
        );

        // Save the updated project
        await project.save();

        res.status(200).json({ success: true, message: 'Stakeholder deleted successfully' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
