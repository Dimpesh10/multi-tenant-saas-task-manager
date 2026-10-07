const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ organization: 1, workspace: 1 });
taskSchema.index({ assignee: 1 });

module.exports = mongoose.model("Task", taskSchema);
