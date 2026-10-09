import { Outlet } from "react-router";
import AuthLayoutComponent from "../components/auth/AuthLayout";

export default function AuthLayout() {
  return (
    <AuthLayoutComponent>
      <Outlet />
    </AuthLayoutComponent>
  );
}

