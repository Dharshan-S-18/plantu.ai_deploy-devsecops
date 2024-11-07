import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Store user ID or username
  text: { type: String, required: true }, // The content of the comment
  timestamp: { type: Date, default: Date.now }, // The date the comment was made
});

// Define the Subtask Schema
const SubtaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assignee: { type: String },
  dueDate: { type: Date },
  priority: { type: String },
  status: { type: String },
  comments: { type: String },
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
  actualEffort: { type: Number},
  allocatedEffort: { type: Number},
  status: { type: String },
  milestone: { type: Boolean, default: false },
  relation: [{ type: String }],
  dependency: { type: String },
  comments: [CommentSchema],
  actualEffort: { type: String }, // Field for additional notes
  description: { type: String }, // Field for description
  checklist: [
    {
      text: String,
      completed: Boolean,
    },
  ],
  subtasks: [SubtaskSchema], // Embed subtasks schema here
});

// Define the Project Schema, including the Task Schema
const ProjectSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  projectId: { type: String, required: true },
  projectName: { type: String },
  description: { type: String },
  statusList: [StatusSchema],
  //   status: { type: String },
  //   startDate: { type: Date, required: true },
  //   endDate: { type: Date, required: true },
  //   totalBudget: { type: Number },
  //   budgetStartDate: { type: Date },
  //   businessCase: { type: String },
  //   actualBudget: { type: Number },
  //   budgetEndDate: { type: Date },
  tasks: [TaskSchema], // Embed Task schema here
});

// Create and export the Project model
export default mongoose.models.ProjectTask ||
  mongoose.model("ProjectTask", ProjectSchema);
