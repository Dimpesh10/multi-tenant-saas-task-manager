const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSockets } = require("./sockets");

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orgs", require("./routes/orgRoutes"));
app.use("/api/workspaces", require("./routes/workspaceRoutes"));
app.use("/api", require("./routes/taskRoutes"));

const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

const server = http.createServer(app);
initSockets(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (HTTP + Socket.io)`)
);
