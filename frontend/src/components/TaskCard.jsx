const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-700",
};

export default function TaskCard({ task, onDragStart, canDrag, onDelete, canDelete }) {
  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => onDragStart(e, task._id)}
      className={`bg-white p-3 rounded shadow-sm border ${canDrag ? "cursor-move" : "cursor-not-allowed opacity-90"}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="font-medium text-sm">{task.title}</div>
        {canDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-500 text-xs hover:underline"
          >
            delete
          </button>
        )}
      </div>
      {task.description && (
        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.assignee && (
          <span className="text-xs text-gray-500">@{task.assignee.name || "user"}</span>
        )}
      </div>
      {task.dueDate && (
        <div className="text-xs text-gray-400 mt-1">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
