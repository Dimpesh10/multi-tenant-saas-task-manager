import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.organization ? "/dashboard" : "/create-org");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/create-org");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
        <p className="text-sm text-center">
          Have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}
