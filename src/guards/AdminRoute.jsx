import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const ADMIN_ROLES = [
  "super_admin",
  "admin",
  "reviewer",
  "support_agent",
];

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}