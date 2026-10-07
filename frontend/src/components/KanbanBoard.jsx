import TaskCard from "./TaskCard";
import { useAuth } from "../context/AuthContext";

const columns = [
  { key: "todo", title: "Todo", bg: "bg-gray-50" },
  { key: "in-progress", title: "In Progress", bg: "bg-blue-50" },
  { key: "done", title: "Done", bg: "bg-green-50" },
];

export default function KanbanBoard({ tasks, onStatusChange, onDelete, onCreateClick }) {
  const { user } = useAuth();

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  const canDragTask = (task) =>
    user.role !== "viewer" ||
    (task.assignee && (task.assignee._id === user.id || task.assignee === user.id));

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.key)}
            className={`${col.bg} rounded p-3 flex flex-col`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm">
                {col.title} <span className="text-gray-500">({colTasks.length})</span>
              </h3>
              {col.key === "todo" && user.role !== "viewer" && (
                <button
                  onClick={onCreateClick}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add
                </button>
              )}
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {colTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onDragStart={handleDragStart}
                  canDrag={canDragTask(task)}
                  onDelete={onDelete}
                  canDelete={user.role === "admin"}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
