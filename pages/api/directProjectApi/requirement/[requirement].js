import dbConnect from '../../../../lib/dbConnect'; // Make sure the path is correct for your dbConnect
import Requirement from '../../../../models/directRequirement'; // Adjust this to your Requirement model
import mongoose from 'mongoose'; // For ObjectId validation

export default async function handler(req, res) {
  const { method } = req;
  const { requirement } = req.query; // The id of the requirement to update (from the URL)
  console.log(req.query);

  await dbConnect();

  if (method === 'PUT') {
    // PUT request to update requirement
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(requirement)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }

      const {
        requirementNo, description, shortDescription, assignedTo, status, projectId, createdBy, createdDate
      } = req.body;

      // Validate that the requirement exists in the database
      const Requirements = await Requirement.findById(requirement);
      if (!Requirements) {
        return res.status(404).json({ success: false, error: 'Requirement not found' });
      }

      // Update the Requirements with the new data (only update fields that are provided)
      Requirements.requirementNo = requirementNo || Requirements.requirementNo;
      Requirements.description = description || Requirements.description;
      Requirements.assignedTo = assignedTo || Requirements.assignedTo;
      Requirements.shortDescription = shortDescription || Requirements.shortDescription;
      Requirements.status = status || Requirements.status;
      Requirements.projectId = projectId || Requirements.projectId;
      Requirements.createdBy = createdBy || Requirements.createdBy;
      Requirements.createdDate = createdDate || Requirements.createdDate;

      // Save the updated Requirements document
      const updatedStakeholder = await Requirements.save();

      // Respond with the updated Requirements
      res.status(200).json({
        success: true,
        message: 'Requirement updated successfully',
        Requirements: updatedStakeholder,
      });
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (method === 'DELETE') {
    // DELETE request to remove Requirements
    try {
      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(requirement)) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
      }
  
      // Validate that the Requirements exists in the database
      const Requirements = await Requirement.findById(requirement);
      if (!Requirements) {
        return res.status(404).json({ success: false, error: 'Requirement not found' });
      }
  
      // Delete the Requirements using deleteOne
      const result = await Requirement.deleteOne({ _id: requirement });
  
      // Check if the deletion was successful
      if (result.deletedCount === 1) {
        res.status(200).json({
          success: true,
          message: 'Requirement deleted successfully',
        });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete Requirements' });
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
