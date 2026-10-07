const express = require("express");
const taskService = require("../services/taskService");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/workspaces/:workspaceId/tasks",
  auth,
  requireRole("admin", "member"),
  asyncHandler(async (req, res) => {
    const task = await taskService.createTask({
      workspaceId: req.params.workspaceId,
      user: req.user,
      data: req.body,
    });
    res.status(201).json(task);
  })
);

router.get(
  "/workspaces/:workspaceId/tasks",
  auth,
  asyncHandler(async (req, res) => {
    const tasks = await taskService.listTasks({
      workspaceId: req.params.workspaceId,
      user: req.user,
      filters: {
        status: req.query.status,
        priority: req.query.priority,
        assignee: req.query.assignee,
      },
    });
    res.json(tasks);
  })
);

router.get(
  "/tasks/:id",
  auth,
  asyncHandler(async (req, res) => {
    const task = await taskService.getTask({ id: req.params.id, user: req.user });
    res.json(task);
  })
);

router.put(
  "/tasks/:id",
  auth,
  requireRole("admin", "member"),
  asyncHandler(async (req, res) => {
    const task = await taskService.updateTask({
      id: req.params.id,
      user: req.user,
      data: req.body,
    });
    res.json(task);
  })
);

router.patch(
  "/tasks/:id/status",
  auth,
  asyncHandler(async (req, res) => {
    const task = await taskService.updateStatus({
      id: req.params.id,
      user: req.user,
      status: req.body.status,
    });
    res.json(task);
  })
);

router.delete(
  "/tasks/:id",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await taskService.deleteTask({ id: req.params.id, user: req.user });
    res.json({ message: "Task deleted" });
  })
);

module.exports = router;
