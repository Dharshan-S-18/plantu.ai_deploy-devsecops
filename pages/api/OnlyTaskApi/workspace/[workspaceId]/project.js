// pages/api/workspace/[workspaceId]/project.js
import dbConnect from '../../../../../lib/dbConnect';
import Workspace from '../../../../../models/workSpace'; // Adjust the path to your Workspace model

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId } = req.query; // Workspace ID
  console.log(workspaceId);

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, message: 'Workspace not found' });
        }
        
        // Add new project to the workspace
        const newProject = req.body; // Project details from the request body
        workspace.projects.push(newProject);
        await workspace.save();

        res.status(201).json({ success: true, data: workspace });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'GET':
      try {
        const workspace = await Workspace.findById(workspaceId).select('projects');
        if (!workspace) {
          return res.status(404).json({ success: false, message: 'Workspace not found' });
        }
        res.status(200).json({ success: true, data: workspace });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
