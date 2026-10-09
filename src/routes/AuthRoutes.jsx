import { Route } from "react-router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";

export default function AuthRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyAccount />} />
    </>
  );
}

