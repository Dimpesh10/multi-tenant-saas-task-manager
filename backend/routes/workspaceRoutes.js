const express = require("express");
const workspaceService = require("../services/workspaceService");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/",
  auth,
  requireRole("admin", "member"),
  asyncHandler(async (req, res) => {
    const workspace = await workspaceService.createWorkspace({
      name: req.body.name,
      user: req.user,
    });
    res.status(201).json(workspace);
  })
);

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await workspaceService.listWorkspaces(req.user));
  })
);

router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const workspace = await workspaceService.getWorkspace({
      id: req.params.id,
      user: req.user,
    });
    res.json(workspace);
  })
);

router.put(
  "/:id",
  auth,
  requireRole("admin", "member"),
  asyncHandler(async (req, res) => {
    const workspace = await workspaceService.updateWorkspace({
      id: req.params.id,
      user: req.user,
      name: req.body.name,
      members: req.body.members,
    });
    res.json(workspace);
  })
);

router.delete(
  "/:id",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await workspaceService.deleteWorkspace({
      id: req.params.id,
      user: req.user,
    });
    res.json({ message: "Workspace deleted" });
  })
);

module.exports = router;
