import dbConnect from '../../../../lib/dbConnect'; // Make sure the path is correct for your dbConnect
import Stakeholder from '../../../../models/directStakeholder'; // Adjust this to your Stakeholder model
import mongoose from 'mongoose'; // For ObjectId validation

export default async function handler(req, res) {
  const { method } = req;
  const { stakeholderId } = req.query; // The id of the stakeholder to update (from the URL)
  console.log(req.query);

  await dbConnect();

  if (method === 'PUT') {
    // PUT request to update stakeholder
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(stakeholderId)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }

      const {
        name,
        email,
        contact,
        type,
        role,
        projectId,
        createdBy,
        createdDate,
      } = req.body;

      // Validate that the stakeholder exists in the database
      const stakeholder = await Stakeholder.findById(stakeholderId);
      if (!stakeholder) {
        return res.status(404).json({ success: false, error: 'Stakeholder not found' });
      }

      // Update the stakeholder with the new data (only update fields that are provided)
      stakeholder.name = name || stakeholder.name;
      stakeholder.email = email || stakeholder.email;
      stakeholder.contact = contact || stakeholder.contact;
      stakeholder.type = type || stakeholder.type;
      stakeholder.role = role || stakeholder.role;
      stakeholder.projectId = projectId || stakeholder.projectId;
      stakeholder.createdBy = createdBy || stakeholder.createdBy;
      stakeholder.createdDate = createdDate || stakeholder.createdDate;

      // Save the updated stakeholder document
      const updatedStakeholder = await stakeholder.save();

      // Respond with the updated stakeholder
      res.status(200).json({
        success: true,
        message: 'Stakeholder updated successfully',
        stakeholder: updatedStakeholder,
      });
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (method === 'DELETE') {
    // DELETE request to remove stakeholder
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(stakeholderId)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }
  
      // Validate that the stakeholder exists in the database
      const stakeholder = await Stakeholder.findById(stakeholderId);
      if (!stakeholder) {
        return res.status(404).json({ success: false, error: 'Stakeholder not found' });
      }
  
      // Delete the stakeholder using deleteOne
      const result = await Stakeholder.deleteOne({ _id: stakeholderId });
  
      // Check if the deletion was successful
      if (result.deletedCount === 1) {
        res.status(200).json({
          success: true,
          message: 'Stakeholder deleted successfully',
        });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete stakeholder' });
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
