// pages/api/project/[id].js

import dbConnect from '../../../../lib/dbConnect'; // Import your database connection utility
import Project from '../../../../models/taskProject'; // Import your Project model

export default async function handler(req, res) {
  const { method } = req; // Get the HTTP method (GET, POST, PUT, DELETE, etc.)
  const { id } = req.query; // Get the project ID from the request query parameters

  // Connect to the database
  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        // Find the project by ID and update it with the data from the request body
        const project = await Project.findByIdAndUpdate(id, req.body, {
          new: true, // Return the updated project
          runValidators: true, // Ensure the update respects the schema
        });

        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Return the updated project
        res.status(200).json({ success: true, project });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'GET':
      try {
        // Find the project by ID and return it
        const project = await Project.findById(id);
        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, project });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        // Find the project by ID and delete it
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Return success response
        res.status(200).json({ success: true, message: 'Project successfully deleted' });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      // Handle other HTTP methods
      res.setHeader('Allow', ['PUT', 'GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
