const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const { emitToWorkspace } = require("../sockets");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/errors");

const assertSameTenant = (doc, user) => {
  if (!user.organization || doc.organization.toString() !== user.organization.toString()) {
    throw new ForbiddenError("Cross-tenant access denied");
  }
};

const loadWorkspaceForUser = async (workspaceId, user) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new NotFoundError("Workspace not found");
  assertSameTenant(workspace, user);
  return workspace;
};

const isWorkspaceMember = (workspace, userId) =>
  workspace.members.some((m) => m.toString() === userId.toString());

exports.createTask = async ({ workspaceId, user, data }) => {
  if (!data?.title) throw new BadRequestError("title required");

  const workspace = await loadWorkspaceForUser(workspaceId, user);

  if (data.assignee && !isWorkspaceMember(workspace, data.assignee)) {
    throw new BadRequestError("Assignee is not a member of this workspace");
  }

  const task = await Task.create({
    title: data.title,
    description: data.description || "",
    status: data.status || "todo",
    priority: data.priority || "medium",
    assignee: data.assignee || undefined,
    dueDate: data.dueDate || undefined,
    workspace: workspace._id,
    organization: user.organization,
    createdBy: user._id,
  });

  emitToWorkspace(workspace._id.toString(), "task-created", task);
  return task;
};

exports.listTasks = async ({ workspaceId, user, filters = {} }) => {
  await loadWorkspaceForUser(workspaceId, user);

  const query = {
    workspace: workspaceId,
    organization: user.organization,
  };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignee) {
    query.assignee = filters.assignee === "me" ? user._id : filters.assignee;
  }

  return Task.find(query)
    .populate("assignee", "name email")
    .populate("createdBy", "name email")
    .sort("-createdAt");
};

exports.getTask = async ({ id, user }) => {
  const task = await Task.findById(id)
    .populate("assignee", "name email")
    .populate("createdBy", "name email");
  if (!task) throw new NotFoundError("Task not found");
  assertSameTenant(task, user);
  return task;
};

exports.updateTask = async ({ id, user, data }) => {
  const task = await Task.findById(id);
  if (!task) throw new NotFoundError("Task not found");
  assertSameTenant(task, user);

  if (data.assignee && data.assignee !== task.assignee?.toString()) {
    const workspace = await Workspace.findById(task.workspace);
    if (!isWorkspaceMember(workspace, data.assignee)) {
      throw new BadRequestError("Assignee is not a member of this workspace");
    }
  }

  const allowed = ["title", "description", "status", "priority", "assignee", "dueDate"];
  for (const key of allowed) {
    if (data[key] !== undefined) task[key] = data[key];
  }
  await task.save();
  emitToWorkspace(task.workspace.toString(), "task-updated", task);
  return task;
};

exports.updateStatus = async ({ id, user, status }) => {
  if (!status) throw new BadRequestError("status required");

  const task = await Task.findById(id);
  if (!task) throw new NotFoundError("Task not found");
  assertSameTenant(task, user);

  if (user.role === "viewer") {
    if (!task.assignee || task.assignee.toString() !== user._id.toString()) {
      throw new ForbiddenError("Viewers can only update status of tasks assigned to them");
    }
  }

  task.status = status;
  await task.save();
  emitToWorkspace(task.workspace.toString(), "task-updated", task);
  return task;
};

exports.deleteTask = async ({ id, user }) => {
  const task = await Task.findById(id);
  if (!task) throw new NotFoundError("Task not found");
  assertSameTenant(task, user);
  await task.deleteOne();
  emitToWorkspace(task.workspace.toString(), "task-deleted", { _id: task._id });
};
