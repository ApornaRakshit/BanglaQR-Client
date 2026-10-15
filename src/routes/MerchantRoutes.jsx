import { Route, Navigate } from "react-router";
import MerchantRoute from "../guards/MerchantRoute";
import MerchantLayout from "../layouts/MerchantLayout";
import MerchantDashboard from "../pages/merchant/dashboard/MerchantDashboard";

// Onboarding Flow
import OnboardingLayout from "../pages/merchant/onboarding/OnboardingLayout";
import CompanyInformation from "../pages/merchant/onboarding/CompanyInformation";
import ContactInformation from "../pages/merchant/onboarding/ContactInformation";
import CommercialDetails from "../pages/merchant/onboarding/CommercialDetails";
import KYCInformation from "../pages/merchant/onboarding/KYCInformation";
import Documents from "../pages/merchant/onboarding/Documents";
import Verification from "../pages/merchant/onboarding/Verification";
import ReviewSubmit from "../pages/merchant/onboarding/ReviewSubmit";

// Payment Gateways & Applications
import GatewayServices from "../pages/merchant/gateways/GatewayServices";
import GatewayDetails from "../pages/merchant/gateways/GatewayDetails";
import ApplyGateway from "../pages/merchant/gateways/ApplyGateway";
import Applications from "../pages/merchant/gateways/Applications";
import ApplicationDetails from "../pages/merchant/gateways/ApplicationDetails";

// My Services & Addons
import MyServices from "../pages/merchant/services/MyServices";
import ServiceConfiguration from "../pages/merchant/services/ServiceConfiguration";
import Addons from "../pages/merchant/addons/Addons";
import MyAddons from "../pages/merchant/addons/MyAddons";

// Orders & Payments
import MyOrders from "../pages/merchant/orders/MyOrders";
import MyPayments from "../pages/merchant/payments/MyPayments";

// Support & Communication
import Tickets from "../pages/merchant/support/Tickets";
import CreateTicket from "../pages/merchant/support/CreateTicket";
import TicketDetails from "../pages/merchant/support/TicketDetails";
import Notifications from "../pages/merchant/notifications/Notifications";

// Account Settings
import AccountSettings from "../pages/merchant/settings/AccountSettings";
import SecuritySettings from "../pages/merchant/settings/SecuritySettings";

import ApprovedMerchantRoute from "../guards/ApprovedMerchantRoute";

export default function MerchantRoutes() {
  return (
    <Route element={<MerchantRoute />}>
      <Route element={<MerchantLayout />}>
        {/* DASHBOARD */}
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />

        {/* ONBOARDING SHORTCUTS */}
        <Route
          path="/merchant/company"
          element={<Navigate to="/merchant/onboarding/company" replace />}
        />
        <Route
          path="/merchant/kyc"
          element={<Navigate to="/merchant/onboarding/kyc" replace />}
        />

        {/* ONBOARDING STEP FLOW */}
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

        {/* ACCOUNT SETTINGS (Always accessible) */}
        <Route path="/merchant/settings" element={<AccountSettings />} />
        <Route path="/merchant/settings/security" element={<SecuritySettings />} />

        {/* APPROVED-MERCHANT ONLY FEATURES */}
        <Route element={<ApprovedMerchantRoute />}>
          {/* GATEWAY SERVICES & APPLICATIONS */}
          <Route path="/merchant/gateways" element={<GatewayServices />} />
          <Route path="/merchant/gateways/:gatewayId" element={<GatewayDetails />} />
          <Route path="/merchant/gateways/:gatewayId/apply" element={<ApplyGateway />} />
          <Route path="/merchant/applications" element={<Applications />} />
          <Route path="/merchant/applications/:id" element={<ApplicationDetails />} />

          {/* MY SERVICES */}
          <Route path="/merchant/services" element={<MyServices />} />
          <Route path="/merchant/services/:id/configure" element={<ServiceConfiguration />} />

          {/* ADDONS & PLUGINS */}
          <Route path="/merchant/addons" element={<Addons />} />
          <Route path="/merchant/my-addons" element={<MyAddons />} />
          <Route path="/merchant/addons/my" element={<MyAddons />} />

          {/* ORDERS & PAYMENTS */}
          <Route path="/merchant/orders" element={<MyOrders />} />
          <Route path="/merchant/my-orders" element={<MyOrders />} />
          <Route path="/merchant/payments" element={<MyPayments />} />
          <Route path="/merchant/my-payments" element={<MyPayments />} />

          {/* SUPPORT */}
          <Route path="/merchant/support" element={<Tickets />} />
          <Route path="/merchant/support/create" element={<CreateTicket />} />
          <Route path="/merchant/support/:id" element={<TicketDetails />} />

          {/* NOTIFICATIONS */}
          <Route path="/merchant/notifications" element={<Notifications />} />
        </Route>
      </Route>
    </Route>
  );
}
