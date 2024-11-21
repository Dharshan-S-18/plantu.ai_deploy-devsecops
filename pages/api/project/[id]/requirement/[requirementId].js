import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/project';

export default async function handler(req, res) {
  const { method } = req;
  const { id, requirementId } = req.query; // Use requirementId from query
  console.log(req.query);
  console.log(id, requirementId);

  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        const { requirementNo, description, shortDescription, assignedTo, status, createdBy, createdDate } = req.body;

        // Find the project by ID
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Find the requirement by requirementId
        const requirement = project.requirements.id(requirementId);
        if (!requirement) {
          return res.status(404).json({ success: false, error: 'requirement not found' });
        }

        // Update the requirement fields
        requirement.description = description || requirement.description;
        requirement.assignedTo = assignedTo || requirement.assignedTo;
        requirement.requirementNo = requirementNo || requirement.requirementNo;
        requirement.createdBy = createdBy || requirement.createdBy;
        requirement.status = status || requirement.status;
        requirement.shortDescription = shortDescription || requirement.shortDescription;
        requirement.createdDate = createdDate || requirement.createdDate;
       

        // Save the updated project
        await project.save();

        res.status(200).json({ success: true, requirement });
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

        // Find the requirement by requirementId
        const requirement = project.requirements.id(requirementId);
        if (!requirement) {
          return res.status(404).json({ success: false, error: 'Raid not found' });
        }

        // Remove the requirement from the array
        project.requirements = project.requirements.filter(
          (requirement) => requirement._id.toString() !== requirementId
        );

        // Save the updated project
        await project.save();

        res.status(200).json({ success: true, message: 'Raid deleted successfully' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
