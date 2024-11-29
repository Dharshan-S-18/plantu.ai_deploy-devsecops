import mongoose from 'mongoose';

const StakeholderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  type: { type: String, required: true },
  role: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false, default: null }, // Optional, associate with a project
  createdBy: { type: String, required: true },
  createdDate: { type: Date, required: true },
});

export default mongoose.models.Stakeholder || mongoose.model('Stakeholder', StakeholderSchema);
