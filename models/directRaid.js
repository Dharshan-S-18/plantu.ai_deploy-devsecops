import mongoose from 'mongoose';

const RaidSchema = new mongoose.Schema({
    raidId: { type: String },
    description: { type: String },
    assignedTo: { type: String },
    type: { type: String },
    date: { type: Date },
    status: { type: String },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false, default: null }, // Optional, associate with a project
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
});

export default mongoose.models.Raid || mongoose.model('Raid', RaidSchema);
