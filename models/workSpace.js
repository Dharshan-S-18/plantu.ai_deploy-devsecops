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

// Define the Status Schema
const StatusSchema = new mongoose.Schema({
  title: { type: String },
  value: { type: String, required: true },
  color: { type: String },
});

// Define the Task Schema, including the Subtask Schema
const TaskSchema = new mongoose.Schema({
  taskNumber: { type: String },
  name: { type: String },
  assigneePrimary: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  dueDate: { type: Date },
  priority: { type: String },
  status: { type: String },
  relation: [{ type: String }],
  dependency: { type: String },
  comments: [CommentSchema],
  allocatedEffort: { type: String }, // Store time in HH:mm:ss format
  actualEffort: { type: String },       // Field for additional notes
  description: { type: String }, // Field for description
  labels: [{ type: String }],
  milestone: { type: Boolean, default: false },
  checklist: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  subtasks: [SubtaskSchema] // Embed subtasks schema here
});

// Define the Project Schema, including the Task Schema
const ProjectSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  projectId: { type: String, required: true },
  projectName: { type: String },
  description: { type: String },
  assignedAgent: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  priority: { type: String },
  //   budgetStartDate: { type: Date },
  //   businessCase: { type: String },
  //   actualBudget: { type: Number },
  //   budgetEndDate: { type: Date },
  statusList: [StatusSchema], // Embed statusSchema here
  tasks: [TaskSchema], // Embed Task schema here
  labels: [
    {
      name: { type: String, required: true },
      color: { type: String, default: "#FFFFFF" }, // Optional, for color coding labels
    },
  ],
});

// Define the Workspace Schema
const WorkspaceSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date },
  color: { type: String },
  teamMembers: [{ type: String }], // Array of team member names or IDs
  projects: [ProjectSchema] // Reference to projects
});

// Create and export the Project model
export default mongoose.models.WorkSpace || mongoose.model('WorkSpace', WorkspaceSchema);
