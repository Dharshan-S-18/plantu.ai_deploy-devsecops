import dbConnect from "../../../../../../../../lib/dbConnect";
import Workspace from "../../../../../../../../models/workSpace"; // Assuming workspace schema contains projects and tasks

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id, taskId } = req.query; // Extract workspaceId, projectId, and taskId from the query parameters

  await dbConnect();

  console.log(
    `Received workspace id: ${workspaceId}, project id: ${id}, taskId: ${taskId}`
  ); // Log received IDs

  if (!workspaceId || !id || !taskId) {
    console.error("Workspace ID, Project ID, or Task ID is missing");
    return res.status(400).json({
      success: false,
      message: "Workspace ID, Project ID, or Task ID is missing",
    });
  }

  switch (method) {
    case "GET":
      try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
          console.error("Workspace not found");
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        // Find the project within the workspace by project ID
        const project = workspace.projects.id(id);

        if (!project) {
          console.error("Project not found within the specified workspace");
          return res
            .status(404)
            .json({ success: false, message: "Project not found" });
        }

        console.log("Project found:", project);

        // Find the task within the project's tasks array by taskId
        const task = project.tasks.id(taskId);

        if (!task) {
          console.error(`Task with ID ${taskId} not found in project ${id}`);
          return res
            .status(404)
            .json({ success: false, message: "Task not found" });
        }

        console.log("Task found:", task);

        return res.status(200).json({ success: true, task: task });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "PUT":
      try {
        // Find the workspace by ID
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
          console.error("Workspace not found");
          return res
            .status(404)
            .json({ success: false, message: "Workspace not found" });
        }

        // Find the project within the workspace by project ID
        const project = workspace.projects.id(id);

        if (!project) {
          console.error("Project not found within the specified workspace");
          return res
            .status(404)
            .json({ success: false, message: "Project not found" });
        }

        console.log("Project found:", project);

        // Find the task within the project's tasks array by taskId
        const task = project.tasks.id(taskId);

        if (!task) {
          console.error(`Task with ID ${taskId} not found in project ${id}`);
          return res
            .status(404)
            .json({ success: false, message: "Task not found" });
        }

        console.log("Task found:", task);

        // Update the task fields with the values from the request body
        task.name = req.body.name || task.name;
        task.assigneePrimary = req.body.assigneePrimary || task.assigneePrimary;
        task.startDate = req.body.startDate || task.startDate;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.priority = req.body.priority || task.priority;
        task.dependency = req.body.dependency || task.dependency;
        task.comments = req.body.comments || task.comments;
        task.checklist = req.body.checklist || task.checklist;
        task.allocatedEffort = req.body.allocatedEffort || task.allocatedEffort;
        task.actualEffort = req.body.actualEffort || task.actualEffort;
        task.description = req.body.description || task.description;
        task.status = req.body.status || task.status;
        task.relation = req.body.relation || task.relation;
        task.labels = req.body.labels || task.labels;
        // Update milestone specifically to handle true or false values
        if (typeof req.body.milestone !== 'undefined') {
          task.milestone = req.body.milestone;
        }

        // Save the updated workspace document
        await workspace.save();

        return res.status(200).json({ success: true, task });
      } catch (error) {
        console.error("Error during task update:", error.message);
        return res.status(400).json({ success: false, message: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
