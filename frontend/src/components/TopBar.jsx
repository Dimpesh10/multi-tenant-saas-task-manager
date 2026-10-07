import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const roleColors = {
  admin: "bg-purple-100 text-purple-700",
  member: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-200 text-gray-700",
};

export default function TopBar({ orgName }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="font-semibold text-lg">{orgName || "Loading..."}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${roleColors[user.role]}`}>
          {user.role}
        </span>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
