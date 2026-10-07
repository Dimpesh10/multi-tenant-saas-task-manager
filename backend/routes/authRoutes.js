const express = require("express");
const authService = require("../services/authService");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  })
);

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
