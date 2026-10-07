const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Workspace = require("../models/Workspace");

let io;

const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.email}`);

    socket.on("join-workspace", async (workspaceId, ack) => {
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return ack?.({ ok: false, error: "Workspace not found" });

        if (
          !socket.user.organization ||
          workspace.organization.toString() !== socket.user.organization.toString()
        ) {
          return ack?.({ ok: false, error: "Cross-tenant access denied" });
        }

        socket.join(`workspace:${workspaceId}`);
        console.log(`${socket.user.email} joined workspace ${workspaceId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("leave-workspace", (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const emitToWorkspace = (workspaceId, event, payload) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
};

module.exports = { initSockets, getIO, emitToWorkspace };
