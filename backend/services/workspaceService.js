const Workspace = require("../models/Workspace");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/errors");

const assertSameTenant = (workspace, user) => {
  if (!user.organization || workspace.organization.toString() !== user.organization.toString()) {
    throw new ForbiddenError("Cross-tenant access denied");
  }
};

exports.createWorkspace = async ({ name, user }) => {
  if (!name) throw new BadRequestError("name required");
  if (!user.organization) throw new BadRequestError("You must belong to an organization");

  return Workspace.create({
    name,
    organization: user.organization,
    members: [user._id],
    createdBy: user._id,
  });
};

exports.listWorkspaces = async (user) => {
  if (!user.organization) return [];
  return Workspace.find({ organization: user.organization }).populate(
    "members",
    "name email role"
  );
};

exports.getWorkspace = async ({ id, user }) => {
  const workspace = await Workspace.findById(id).populate(
    "members",
    "name email role"
  );
  if (!workspace) throw new NotFoundError("Workspace not found");
  assertSameTenant(workspace, user);
  return workspace;
};

exports.updateWorkspace = async ({ id, user, name, members }) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new NotFoundError("Workspace not found");
  assertSameTenant(workspace, user);

  if (name) workspace.name = name;
  if (members) workspace.members = members;
  await workspace.save();
  return workspace;
};

exports.deleteWorkspace = async ({ id, user }) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new NotFoundError("Workspace not found");
  assertSameTenant(workspace, user);
  await workspace.deleteOne();
};
