import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/project';

export default async function handler(req, res) {
  const { method } = req;
  const { id, raidId } = req.query; // Use raidId from query
  console.log(req.query);
  console.log(id, raidId);

  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        const { description, assignedTo, type, date, status, createdBy, createdDate } = req.body;

        // Find the project by ID
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Find the raid by raidId
        const raid = project.raids.id(raidId);
        if (!raid) {
          return res.status(404).json({ success: false, error: 'raid not found' });
        }

        // Update the raid fields
        raid.description = description || raid.description;
        raid.assignedTo = assignedTo || raid.assignedTo;
        raid.type = type || raid.type;
        raid.date = date || raid.date;
        raid.status = status || raid.status;
        raid.createdBy = createdBy || raid.createdBy;
        raid.createdDate = createdDate || raid.createdDate;

        // Save the updated project
        await project.save();

        res.status(200).json({ success: true, raid });
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

        // Find the raid by raidId
        const raid = project.raids.id(raidId);
        if (!raid) {
          return res.status(404).json({ success: false, error: 'Raid not found' });
        }

        // Remove the raid from the array
        project.raids = project.raids.filter(
          (raid) => raid._id.toString() !== raidId
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
