import { Routes, Route } from "react-router";

import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyAccount from "../pages/auth/VerifyAccount";

import MerchantDashboard from "../pages/merchant/MerchantDashboard";

import OnboardingLayout from "../pages/merchant/onboarding/OnboardingLayout";
import CompanyInformation from "../pages/merchant/onboarding/CompanyInformation";
import ContactInformation from "../pages/merchant/onboarding/ContactInformation";
import CommercialDetails from "../pages/merchant/onboarding/CommercialDetails";
import KYCInformation from "../pages/merchant/onboarding/KYCInformation";
import Documents from "../pages/merchant/onboarding/Documents";
import Verification from "../pages/merchant/onboarding/Verification";
import ReviewSubmit from "../pages/merchant/onboarding/ReviewSubmit";

import ProtectedRoute from "../guards/ProtectedRoute";
import MerchantRoute from "../guards/MerchantRoute";

import MerchantLayout from "../layouts/MerchantLayout";
import { Navigate } from "react-router";

export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify"
        element={<VerifyAccount />}
      />

      {/* AUTHENTICATED */}
      <Route element={<ProtectedRoute />}>

        {/* MERCHANT */}
        <Route element={<MerchantRoute />}>

          <Route element={<MerchantLayout />}>

            <Route
              path="/merchant/dashboard"
              element={<MerchantDashboard />}
            />

            <Route
              path="/merchant/company"
              element={<Navigate to="/merchant/onboarding/company" replace />}
            />

            <Route
              path="/merchant/kyc"
              element={<Navigate to="/merchant/onboarding/kyc" replace />}
            />

            {/* ONBOARDING */}
            <Route path="/merchant/onboarding" element={<OnboardingLayout />}>
              <Route index element={<Navigate to="/merchant/onboarding/company" replace />} />
              <Route path="company" element={<CompanyInformation />} />
              <Route path="contact" element={<ContactInformation />} />
              <Route path="commercial" element={<CommercialDetails />} />
              <Route path="kyc" element={<KYCInformation />} />
              <Route path="documents" element={<Documents />} />
              <Route path="verification" element={<Verification />} />
              <Route path="review" element={<ReviewSubmit />} />
            </Route>

          </Route>

        </Route>

      </Route>

    </Routes>
  );
}