import { Route } from "react-router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import InstitutionInvitationAccept from "../pages/auth/InstitutionInvitationAccept";

export default function AuthRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/bank/activate" element={<InstitutionInvitationAccept />} />
      <Route path="/auth/institution-invitation" element={<InstitutionInvitationAccept />} />
    </>
  );
}

