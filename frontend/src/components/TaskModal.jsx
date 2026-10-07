import { useState } from "react";

export default function TaskModal({ members, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({
        title,
        description,
        priority,
        assignee: assignee || undefined,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96 space-y-3">
        <h2 className="text-xl font-semibold">Create Task</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
        <input required type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" rows={3} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border p-2 rounded">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full border p-2 rounded">
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
          ))}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border p-2 rounded" />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
