const Organization = require("../models/Organization");
const User = require("../models/User");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors");

exports.createOrg = async ({ name, userId }) => {
  if (!name) throw new BadRequestError("name required");

  const org = await Organization.create({
    name,
    owner: userId,
    members: [userId],
  });

  await User.findByIdAndUpdate(userId, {
    organization: org._id,
    role: "admin",
  });

  return org;
};

exports.getMyOrg = async (user) => {
  if (!user.organization) return null;
  return Organization.findById(user.organization).populate(
    "members",
    "name email role"
  );
};

exports.renameOrg = async ({ orgId, name }) => {
  if (!name) throw new BadRequestError("name required");
  return Organization.findByIdAndUpdate(orgId, { name }, { new: true });
};

exports.inviteMember = async ({ orgId, email, role }) => {
  if (!email) throw new BadRequestError("email required");

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found. They must register first.");

  if (user.organization && user.organization.toString() === orgId.toString()) {
    throw new ConflictError("User already in this organization");
  }

  user.organization = orgId;
  user.role = role && ["admin", "member", "viewer"].includes(role) ? role : "member";
  await user.save();

  await Organization.findByIdAndUpdate(orgId, {
    $addToSet: { members: user._id },
  });

  return { id: user._id, email: user.email, role: user.role };
};

exports.removeMember = async ({ orgId, userId }) => {
  await Organization.findByIdAndUpdate(orgId, { $pull: { members: userId } });
  await User.findByIdAndUpdate(userId, {
    $unset: { organization: "" },
    role: "member",
  });
};
