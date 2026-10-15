import { Routes, Route } from "react-router";
import ProtectedRoute from "../guards/ProtectedRoute";

import PublicRoutes from "./PublicRoutes";
import AuthRoutes from "./AuthRoutes";
import AdminRoutes from "./AdminRoutes";
import MerchantRoutes from "./MerchantRoutes";
import UserRoutes from "./UserRoutes";
import InstitutionRoutes from "./InstitutionRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      {PublicRoutes()}

      {/* AUTH ROUTES */}
      {AuthRoutes()}

      {/* PROTECTED DOMAINS */}
      <Route element={<ProtectedRoute />}>
        {/* ADMIN PORTAL */}
        {AdminRoutes()}

        {/* INSTITUTION PORTAL */}
        {InstitutionRoutes()}

        {/* MERCHANT PORTAL */}
        {MerchantRoutes()}

        {/* USER PORTAL */}
        {UserRoutes()}
      </Route>
    </Routes>
  );
}