import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ workspaces, activeId, onSelect, onCreate, onInvite }) {
  const { user } = useAuth();
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName("");
    setShowForm(false);
  };

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col">
      <h2 className="text-xs uppercase text-gray-500 font-semibold mb-2">Workspaces</h2>
      <ul className="space-y-1 flex-1">
        {workspaces.map((ws) => (
          <li key={ws._id}>
            <button
              onClick={() => onSelect(ws._id)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                activeId === ws._id ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"
              }`}
            >
              {ws.name}
            </button>
          </li>
        ))}
      </ul>

      {user.role !== "viewer" && (
        <div className="mt-2">
          {showForm ? (
            <form onSubmit={handleCreate} className="space-y-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workspace name"
                className="w-full border p-1 rounded text-sm"
              />
              <div className="flex gap-1">
                <button type="submit" className="flex-1 bg-blue-600 text-white text-xs p-1 rounded">Add</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-xs p-1 rounded">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full text-left text-sm text-blue-600 hover:underline px-3 py-1">
              + New workspace
            </button>
          )}
        </div>
      )}

      {user.role === "admin" && (
        <button onClick={onInvite} className="mt-4 text-sm text-purple-600 hover:underline px-3 py-1 text-left">
          + Invite member
        </button>
      )}
    </aside>
  );
}
