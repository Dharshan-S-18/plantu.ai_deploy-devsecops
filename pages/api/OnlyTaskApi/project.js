import dbConnect from '../../../lib/dbConnect'; // Adjust the path to your dbConnect utility
import project from '../../../models/taskProject';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const Projects = await project.create(req.body); // Create a new project in the database
      res.status(201).json({ success: true, Projects });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }else if (method === 'GET') {
    try {
      const { accountId } = req.query;
      const projects = await project.find({accountId}); // Fetch all project from the database
      res.status(200).json({ success: true, projects });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
