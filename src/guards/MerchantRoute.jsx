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

  const isMerchant =
    user.role === "merchant" ||
    (Array.isArray(user.roles) && user.roles.includes("merchant")) ||
    Boolean(user.isMerchant);

  if (!isMerchant) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}