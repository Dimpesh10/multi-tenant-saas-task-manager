import { useState } from "react";

export default function InviteModal({ onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await onInvite(email, role);
      setSuccess(`${email} added as ${role}`);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Invite failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96 space-y-3">
        <h2 className="text-xl font-semibold">Invite Member</h2>
        <p className="text-xs text-gray-600">User must already be registered.</p>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded text-sm">{success}</div>}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Invite</button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">Close</button>
        </div>
      </form>
    </div>
  );
}
