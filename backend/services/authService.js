const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { BadRequestError, ConflictError } = require("../utils/errors");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    throw new BadRequestError("name, email, password required");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError("Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: role || "admin",
  });

  return {
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) throw new BadRequestError("email and password required");

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new BadRequestError("Invalid credentials");

  return {
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    },
  };
};
