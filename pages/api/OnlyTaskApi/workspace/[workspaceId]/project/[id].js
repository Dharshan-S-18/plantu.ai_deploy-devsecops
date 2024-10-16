// pages/api/project/[id].js

import dbConnect from "../../../../../../lib/dbConnect"; // Import your database connection utility
import Workspace from "../../../../../../models/workSpace"; // Import your Workspace model

export default async function handler(req, res) {
  const { method } = req; // Get the HTTP method (GET, POST, PUT, DELETE, etc.)
  const { workspaceId, id } = req.query; // Get workspace and project ID from the query parameters
  console.log(req.query);

  // Connect to the database
  await dbConnect();

  switch (method) {
    case "PUT":
      try {
        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        // Find the project within the workspace by project ID and update it
        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({
              success: false,
              message: "Project not found in this workspace",
            });
        }

        // Update the project with the data from the request body
        Object.assign(project, req.body); // Merge the new data into the existing project object
        await workspace.save(); // Save the workspace document with the updated project

        res.status(200).json({ success: true, project });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "GET":
      try {
        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        // Find the project within the workspace by project ID
        const project = workspace.projects.id(id);
        if (!project) {
          return res
            .status(404)
            .json({
              success: false,
              message: "Project not found in this workspace",
            });
        }

        res.status(200).json({ success: true, project });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

      case "DELETE":
        try {
          // Find the workspace by ID
          const workspace = await Workspace.findById(workspaceId);
          if (!workspace) {
            return res
              .status(404)
              .json({ success: false, message: "Workspace not found" });
          }
      
          // Find the project within the workspace by project ID
          const project = workspace.projects.id(id);
          if (!project) {
            return res
              .status(404)
              .json({
                success: false,
                message: "Project not found in this workspace",
              });
          }
      
          // Remove the project from the workspace's projects array
          workspace.projects.pull({ _id: id });
          await workspace.save(); // Save the updated workspace
      
          res
            .status(200)
            .json({ success: true, message: "Project successfully deleted" });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;

    default:
      // Handle other HTTP methods
      res.setHeader("Allow", ["PUT", "GET", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
