import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false });
    }
  } else {
    res.status(400).json({ success: false });
  }
}
