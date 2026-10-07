const express = require("express");
const orgService = require("../services/orgService");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const org = await orgService.createOrg({
      name: req.body.name,
      userId: req.user._id,
    });
    res.status(201).json(org);
  })
);

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    res.json(await orgService.getMyOrg(req.user));
  })
);

router.put(
  "/",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const org = await orgService.renameOrg({
      orgId: req.user.organization,
      name: req.body.name,
    });
    res.json(org);
  })
);

router.post(
  "/invite",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const user = await orgService.inviteMember({
      orgId: req.user.organization,
      email: req.body.email,
      role: req.body.role,
    });
    res.json({ message: "User added to organization", user });
  })
);

router.delete(
  "/members/:userId",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await orgService.removeMember({
      orgId: req.user.organization,
      userId: req.params.userId,
    });
    res.json({ message: "Member removed" });
  })
);

module.exports = router;
