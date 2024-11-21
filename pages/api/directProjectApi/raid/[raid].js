import dbConnect from '../../../../lib/dbConnect'; // Make sure the path is correct for your dbConnect
import Raid from '../../../../models/directRaid'; // Adjust this to your Raid model
import mongoose from 'mongoose'; // For ObjectId validation

export default async function handler(req, res) {
  const { method } = req;
  const { raid } = req.query; // The id of the raid to update (from the URL)
  console.log(req.query);

  await dbConnect();

  if (method === 'PUT') {
    // PUT request to update raid
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(raid)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }

      const {
        raidId,
        description,
        assignedTo,
        type,
        date,
        status,
        projectId,
        createdBy,
        createdDate,
      } = req.body;

      // Validate that the raid exists in the database
      const Raids = await Raid.findById(raid);
      if (!Raids) {
        return res.status(404).json({ success: false, error: 'Raid not found' });
      }

      // Update the Raids with the new data (only update fields that are provided)
      Raids.raidId = raidId || Raids.raidId;
      Raids.description = description || Raids.description;
      Raids.assignedTo = assignedTo || Raids.assignedTo;
      Raids.type = type || Raids.type;
      Raids.status = status || Raids.status;
      Raids.date = date || Raids.date;
      Raids.projectId = projectId || Raids.projectId;
      Raids.createdBy = createdBy || Raids.createdBy;
      Raids.createdDate = createdDate || Raids.createdDate;

      // Save the updated Raids document
      const updatedStakeholder = await Raids.save();

      // Respond with the updated Raids
      res.status(200).json({
        success: true,
        message: 'Raid updated successfully',
        Raids: updatedStakeholder,
      });
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (method === 'DELETE') {
    // DELETE request to remove Raids
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(raid)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }
  
      // Validate that the Raids exists in the database
      const Raids = await Raid.findById(raid);
      if (!Raids) {
        return res.status(404).json({ success: false, error: 'Raid not found' });
      }
  
      // Delete the Raids using deleteOne
      const result = await Raid.deleteOne({ _id: raid });
  
      // Check if the deletion was successful
      if (result.deletedCount === 1) {
        res.status(200).json({
          success: true,
          message: 'Raid deleted successfully',
        });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete Raids' });
      }
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    // If the method is neither PUT nor DELETE, return a Method Not Allowed error
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
