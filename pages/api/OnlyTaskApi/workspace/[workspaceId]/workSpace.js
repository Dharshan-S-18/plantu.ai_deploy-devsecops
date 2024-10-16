// pages/api/workspace/[workspaceId]/index.js
import dbConnect from '../../../../../lib/dbConnect';
import Workspace from '../../../../../models/workSpace'; // Adjust the path to your Workspace model

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId } = req.query; // Workspace ID from the URL

  await dbConnect();

  switch (method) {
    // GET: Fetch workspace details by workspaceId
    case 'GET':
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        res.status(200).json({
          success: true,
          data: workspace, // Return full workspace details
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // PUT: Update workspace details by workspaceId
    case 'PUT':
      try {
        const updatedData = req.body; // Data to update from the request body
        const workspace = await Workspace.findByIdAndUpdate(workspaceId, updatedData, {
          new: true, // Return the updated document
          runValidators: true, // Ensure the update follows schema validation
        });

        if (!workspace) {
          return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        res.status(200).json({
          success: true,
          data: workspace, // Return updated workspace details
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    // DELETE: Delete workspace by workspaceId
    case 'DELETE':
      try {
        const deletedWorkspace = await Workspace.findByIdAndDelete(workspaceId);

        if (!deletedWorkspace) {
          return res.status(404).json({ success: false, message: 'Workspace not found' });
        }

        res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
