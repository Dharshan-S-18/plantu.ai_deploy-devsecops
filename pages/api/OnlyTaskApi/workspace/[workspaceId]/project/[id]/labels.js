// pages/api/project/[projectId]/labels.js

import dbConnect from "../../../../../../../lib/dbConnect";
import Workspace from "../../../../../../../models/workSpace"; // Assuming Workspace model contains projects and tasks
import mongoose from "mongoose";

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id } = req.query; // workspaceId and projectId (id)
  console.log(req.query);
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid id format" });
  }

  const defaultLabels = [
    { name: "Test", color: "#e57373" },
    { name: "Integration", color: "#81c784" },
    { name: "Demo", color: "#64b5f6" },
    { name: "Client", color: "#ffb74d" },
    { name: "Review", color: "#4db6ac" }
  ];

  switch (method) {
    case "GET":
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: "Workspace not found" });
        }
        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: "Project not found in this workspace",
          });
        }

        // Check if labels are initialized, if not add default labels
        if (!Array.isArray(project.labels) || project.labels.length === 0) {
          project.labels = defaultLabels;
          await workspace.save();
        }

        res.status(200).json({ success: true, labels: project.labels });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const { name, color } = req.body;
        if (!name) {
          return res.status(400).json({ success: false, error: "Label name is required" });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: "Project not found in this workspace",
          });
        }

        const newLabel = {
          name,
          color: color || "#111", // Default color if not provided
        };

        project.labels.push(newLabel);
        await workspace.save();

        res.status(200).json({ success: true, labels: project.labels });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

      case 'PUT':
        try {
          const { labelId, newLabelName, newLabelColor } = req.body;
  
          const workspace = await Workspace.findOne({ 'projects._id': id });
          const project = workspace.projects.id(id);
          const label = project.labels.id(labelId);
  
          if (!label) return res.status(404).json({ success: false, error: 'Label not found' });
  
          label.name = newLabelName; // Update label name
          label.color = newLabelColor; // Update label color
          await workspace.save();
  
          res.status(200).json({ success: true, labels: project.labels });
        } catch (error) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
