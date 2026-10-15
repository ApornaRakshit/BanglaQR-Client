import { Route, Navigate } from "react-router";
import InstitutionRoute from "../guards/InstitutionRoute";
import InstitutionLayout from "../layouts/InstitutionLayout";

import InstitutionDashboard from "../pages/institution/Dashboard";
import InstitutionApplications from "../pages/institution/Applications";
import InstitutionKycReview from "../pages/institution/KycReview";
import InstitutionBranches from "../pages/institution/Branches";
import InstitutionStaffManagement from "../pages/institution/StaffManagement";
import InstitutionServices from "../pages/institution/Services";
import InstitutionConnections from "../pages/institution/Connections";
import InstitutionReports from "../pages/institution/Reports";

export default function InstitutionRoutes() {
  return (
    <Route element={<InstitutionRoute />}>
      <Route element={<InstitutionLayout />}>
        {/* Redirect */}
        <Route path="/institution" element={<Navigate to="/institution/dashboard" replace />} />

        {/* Portal Pages */}
        <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        <Route path="/institution/applications" element={<InstitutionApplications />} />
        <Route path="/institution/applications/:id" element={<InstitutionKycReview />} />
        <Route path="/institution/kyc-review" element={<InstitutionApplications />} />
        <Route path="/institution/merchants" element={<InstitutionApplications />} />
        <Route path="/institution/branches" element={<InstitutionBranches />} />
        <Route path="/institution/staff" element={<InstitutionStaffManagement />} />
        <Route path="/institution/services" element={<InstitutionServices />} />
        <Route path="/institution/connections" element={<InstitutionConnections />} />
        <Route path="/institution/reports" element={<InstitutionReports />} />
      </Route>
    </Route>
  );
}

