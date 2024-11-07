import dbConnect from '../../../../../../../lib/dbConnect';
import Workspace from '../../../../../../../models/workSpace'; // Assuming Workspace model contains projects and tasks

export default async function handler(req, res) {
  const { method } = req;
  const { workspaceId, id } = req.query; // Extract workspaceId and projectId from the query parameters
  console.log(req.query);

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const {
          name,
          assigneePrimary,
          startDate,
          dueDate,
          taskNumber,
          priority,
          comments,
          dependency,
          description,
          allocatedEffort,
          actualEffort,
          checklist,
          status,
          relation,
          milestone,
        } = req.body;

        // Find the workspace and the project within it
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found in this workspace' });
        }

        // Create a new task and push it to the project's task array
        const newTask = {
          name,
          assigneePrimary,
          startDate,
          dueDate,
          taskNumber,
          priority,
          comments,
          dependency,
          description,
          allocatedEffort,
          actualEffort,
          checklist,
          status,
          milestone,
          relation,
        };

        project.tasks.push(newTask); // Add new task to the project
        await workspace.save(); // Save the workspace document with the new task

        res.status(201).json({ success: true, task: newTask });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'GET':
      try {
        // Find the workspace and the project within it
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        const project = workspace.projects.id(id);
        if (!project) {
          return res.status(404).json({ success: false, error: 'Project not found in this workspace' });
        }

        res.status(200).json({ success: true, tasks: project.tasks });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
