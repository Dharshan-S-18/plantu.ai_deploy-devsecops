import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema({
    requirementNo: { type: String },
    description: { type: String },
    shortDescription: { type: String },
    assignedTo: { type: String },
    status: { type: String },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false, default: null }, // Optional, associate with a project
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
});

export default mongoose.models.Requirement || mongoose.model('Requirement', RequirementSchema);
