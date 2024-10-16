// pages/api/project/[projectId]/statusList.js

import dbConnect from "../../../../../../../lib/dbConnect";
import Workspace from "../../../../../../../models/workSpace"; // Assuming Workspace model contains projects and tasks

import mongoose from "mongoose";

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id } = req.query;
  console.log(req.query);
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid id format" });
  }
  switch (method) {
    case "GET":
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, error: "Project not found" });
        }
        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: "Project not found in this workspace",
          });
        }
        res
          .status(200)
          .json({ success: true, statusList: project.statusList || [] });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const { title, value, color } = req.body;
        if (!value || !title) {
          return res
            .status(400)
            .json({ success: false, error: "Status value is required" });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, error: "Project not found" });
        }
        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: "Project not found in this workspace",
          });
        }
        const newStatus = {
          title,
          value,
          color: color ? color : "#111",
        };
        if (!Array.isArray(project.statusList)) {
          project.statusList = []; // Initialize as an empty array if not already an array
        }
        project.statusList.push(newStatus);
        await workspace.save();
        res.status(200).json({ success: true, statusList: project.statusList });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        const { prevValue, title, value, color } = req.body;
        if (!prevValue || !value || !title) {
          return res.status(400).json({
            success: false,
            error: "Previous value, title, and value are required",
          });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res
            .status(404)
            .json({ success: false, error: "Workspace not found" });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({
            success: false,
            error: "Project not found in this workspace",
          });
        }

        const statusIndex = project.statusList.findIndex(
          (status) => status.value === prevValue
        );

        if (statusIndex === -1) {
          return res
            .status(404)
            .json({ success: false, error: "Status not found" });
        }

        // Update the found status
        project.statusList[statusIndex] = {
          title,
          value,
          color: color || "#111",
        };

        await Workspace.updateMany(
          { "tasks.status": prevValue },
          { $set: { "tasks.$[elem].status": title } },
          {
            arrayFilters: [
              { "project._id": project.id, "elem.status": prevValue },
            ],
          }
        );

        await workspace.save();

        res.status(200).json({ success: true, statusList: project.statusList });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }

      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
