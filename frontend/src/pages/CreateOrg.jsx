import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CreateOrg() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.organization) return navigate("/dashboard");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data: org } = await api.post("/orgs", { name });
      setUser({ ...user, organization: org._id, role: "admin" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create org");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-semibold">Create Your Organization</h1>
        <p className="text-sm text-gray-600">You'll be the admin.</p>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
        <input type="text" placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
        <button type="button" onClick={handleLogout} className="w-full text-sm text-gray-500 hover:underline">
          Logout and use a different account
        </button>
      </form>
    </div>
  );
}
