import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store user ID or username
  text: { type: String, required: true },  // The content of the comment
  timestamp: { type: Date, default: Date.now } // The date the comment was made
});

const SubtaskCommentSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store user ID or username
  text: { type: String, required: true },  // The content of the comment
  timestamp: { type: Date, default: Date.now } // The date the comment was made
});

// Define the Stakeholder Schema
const RequirementSchema = new mongoose.Schema({
  requirementNo: { type: String },
  description: { type: String },
  shortDescription: { type: String },
  assignedTo: { type: String },
  createdBy: { type: String },
  status: { type: String },
  createdDate: { type: Date, required: true },
});

// Define the Stakeholder Schema
const RaidSchema = new mongoose.Schema({
  raidId: { type: String },
  description: { type: String },
  assignedTo: { type: String },
  type: { type: String },
  date: { type: Date },
  status: { type: String },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, required: true },
});

// Define the Stakeholder Schema
const StakeholdersSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  contact: { type: Number },
  type: { type: String },
  role: { type: String },
  createdDate: { type: Date },
  createdBy: { type: String },
});

// Define the Subtask Schema
const SubtaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  assignee: { type: String },
  dueDate: { type: Date },
  priority: { type: String },
  allocatedEffort: { type: String }, // Store time in HH:mm:ss format
  actualEffort: { type: String },       // Field for additional notes
  status: { type: String },
  comments: [SubtaskCommentSchema],
  checklist: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
});

// Define the Task Schema, including the Subtask Schema
const TaskSchema = new mongoose.Schema({
  name: { type: String },
  assigneePrimary: { type: [String] }, // Changed to an array to store multiple assignees
  assigneeSecondary: { type: String },
  startDate: { type: Date },
  dueDate: { type: Date },
  priority: { type: String },
  status: { type: String },
  dependencies: [{ type: String }],
  comments: [CommentSchema],
  allocatedEffort: { type: String }, // Store time in HH:mm:ss format
  actualEffort: { type: String },       // Field for additional notes
  description: { type: String }, // Field for description
  milestone: { type: Boolean, default: false },
  checklist: [
    {
      text: String,
      completed: Boolean,
    },
  ],
  subtasks: [SubtaskSchema] // Embed subtasks schema here
});



// Define the Project Schema, including the Task Schema
const ProjectSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  projectId: { type: String, required: true },
  projectName: { type: String },
  projectManager: { type: String },
  description: { type: String },
  status: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalBudget: { type: Number },
  budgetStartDate: { type: Date },
  businessCase: { type: String },
  createdDate: { type: Date },
  createdBy: { type: String },
  actualBudget: { type: Number },
  budgetEndDate: { type: Date },
  tasks: [TaskSchema], // Embed Task schema here
  comments: [CommentSchema], // Embed the Comment schema
  stakeholders: [StakeholdersSchema],
  raids: [RaidSchema],
  requirements: [RequirementSchema]
});

// Create and export the Project model
export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
