import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function MerchantRoute() {
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

  if (user.role !== "merchant") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}