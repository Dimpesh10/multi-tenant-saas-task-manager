import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import TaskModal from "../components/TaskModal";
import InviteModal from "../components/InviteModal";

export default function Dashboard() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (!user?.organization) {
      navigate("/create-org");
      return;
    }
    api.get("/orgs").then((res) => setOrg(res.data));
    api.get("/workspaces").then((res) => {
      setWorkspaces(res.data);
      if (res.data.length > 0) setActiveId(res.data[0]._id);
    });
  }, [user, navigate]);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/workspaces/${activeId}/tasks`).then((res) => setTasks(res.data));
  }, [activeId]);

  useEffect(() => {
    if (!socket || !activeId) return;

    socket.emit("join-workspace", activeId, (res) => {
      if (!res?.ok) console.error("Join failed:", res?.error);
    });

    const onCreated = (task) => {
      if (task.workspace === activeId) {
        setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [task, ...prev]));
      }
    };
    const onUpdated = (task) => {
      if (task.workspace === activeId) {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      }
    };
    const onDeleted = ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    };

    socket.on("task-created", onCreated);
    socket.on("task-updated", onUpdated);
    socket.on("task-deleted", onDeleted);

    return () => {
      socket.emit("leave-workspace", activeId);
      socket.off("task-created", onCreated);
      socket.off("task-updated", onUpdated);
      socket.off("task-deleted", onDeleted);
    };
  }, [socket, activeId]);

  const createWorkspace = async (name) => {
    const { data } = await api.post("/workspaces", { name });
    setWorkspaces((prev) => [...prev, data]);
    setActiveId(data._id);
  };

  const createTask = async (data) => {
    const { data: task } = await api.post(`/workspaces/${activeId}/tasks`, data);
    setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [task, ...prev]));
  };

  const updateStatus = async (taskId, status) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
      api.get(`/workspaces/${activeId}/tasks`).then((res) => setTasks(res.data));
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const inviteMember = async (email, role) => {
    await api.post("/orgs/invite", { email, role });
    const { data } = await api.get("/orgs");
    setOrg(data);
  };

  const activeWorkspace = workspaces.find((w) => w._id === activeId);
  const members = org?.members || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar orgName={org?.name} />
      <div className="text-xs text-gray-500 px-6 py-1">
        Socket: {connected ? "🟢 live" : "⚪ connecting..."}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          workspaces={workspaces}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createWorkspace}
          onInvite={() => setShowInviteModal(true)}
        />
        <main className="flex-1 p-6 overflow-hidden">
          {activeWorkspace ? (
            <>
              <h1 className="text-2xl font-semibold mb-4">{activeWorkspace.name}</h1>
              <KanbanBoard
                tasks={tasks}
                onStatusChange={updateStatus}
                onDelete={deleteTask}
                onCreateClick={() => setShowTaskModal(true)}
              />
            </>
          ) : (
            <div className="text-gray-500">
              {workspaces.length === 0
                ? "Create your first workspace to get started."
                : "Select a workspace."}
            </div>
          )}
        </main>
      </div>

      {showTaskModal && (
        <TaskModal
          members={members}
          onClose={() => setShowTaskModal(false)}
          onSubmit={createTask}
        />
      )}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={inviteMember}
        />
      )}
    </div>
  );
}
