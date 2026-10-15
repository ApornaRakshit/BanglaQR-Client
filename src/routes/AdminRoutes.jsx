import { Route, Navigate } from "react-router";
import AdminRoute from "../guards/AdminRoute";
import AdminLayout from "../layouts/AdminLayout";

// 1. Dashboard
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";

// 2. Merchants
import Merchants from "../pages/admin/merchants/Merchants";
import PendingMerchants from "../pages/admin/merchants/PendingMerchants";
import UnderReviewMerchants from "../pages/admin/merchants/UnderReviewMerchants";
import ApprovedMerchants from "../pages/admin/merchants/ApprovedMerchants";
import RejectedMerchants from "../pages/admin/merchants/RejectedMerchants";
import SuspendedMerchants from "../pages/admin/merchants/SuspendedMerchants";
import MerchantDetails from "../pages/admin/merchants/MerchantDetails";

// 3. KYC
import KycDashboard from "../pages/admin/kyc/KycDashboard";
import KycReview from "../pages/admin/kyc/KycReview";
import KycDetails from "../pages/admin/kyc/KycDetails";

// 4. Documents
import Documents from "../pages/admin/documents/Documents";
import DocumentReview from "../pages/admin/documents/DocumentReview";

// 5. Gateways
import GatewayManagement from "../pages/admin/gateways/GatewayManagement";
import GatewayApplications from "../pages/admin/gateways/GatewayApplications";
import GatewayServices from "../pages/admin/gateways/GatewayServices";
import GatewayDetails from "../pages/admin/gateways/GatewayDetails";

// 6. Add-ons
import AddonManagement from "../pages/admin/addons/AddonManagement";
import AddonDetails from "../pages/admin/addons/AddonDetails";

// 6.1 Orders & Payments
import OrderManagement from "../pages/admin/orders/OrderManagement";
import PaymentManagement from "../pages/admin/payments/PaymentManagement";

// Support
import SupportTickets from "../pages/admin/support/SupportTickets";
import TicketDetails from "../pages/admin/support/TicketDetails";

// 9. Notifications
import NotificationManagement from "../pages/admin/notifications/NotificationManagement";

// 10. Audit Logs
import AuditLogs from "../pages/admin/audit/AuditLogs";

// 11. Settings
import AdminSettings from "../pages/admin/settings/AdminSettings";

// 12. Profile
import AdminProfile from "../pages/admin/profile/AdminProfile";

// 13. CMS
import CmsHomepage from "../pages/admin/cms/CmsHomepage";

// 14. Contact Inquiries
import ContactInquiries from "../pages/admin/inquiries/ContactInquiries";

// 15. Bank Management
import BankManagement from "../pages/admin/institutions/BankManagement";
import AddBank from "../pages/admin/institutions/AddBank";
import BankServices from "../pages/admin/institutions/BankServices";
import BankUsers from "../pages/admin/institutions/BankUsers";
import BankKycRequirements from "../pages/admin/institutions/BankKycRequirements";
import BankSettings from "../pages/admin/institutions/BankSettings";
import BankDetails from "../pages/admin/institutions/BankDetails";
import KycRequirementForm from "../pages/admin/institutions/KycRequirementForm";

export default function AdminRoutes() {
  return (
    <Route element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        {/* Redirect */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Merchant Management */}
        <Route path="/admin/merchants" element={<Merchants />} />
        <Route path="/admin/merchants/pending" element={<PendingMerchants />} />
        <Route path="/admin/merchants/under-review" element={<UnderReviewMerchants />} />
        <Route path="/admin/merchants/approved" element={<ApprovedMerchants />} />
        <Route path="/admin/merchants/rejected" element={<RejectedMerchants />} />
        <Route path="/admin/merchants/suspended" element={<SuspendedMerchants />} />
        <Route path="/admin/merchants/:merchantId" element={<MerchantDetails />} />

        {/* KYC & Applications */}
        <Route path="/admin/kyc" element={<KycDashboard />} />
        <Route path="/admin/kyc/pending" element={<KycReview initialStatus="pending" />} />
        <Route path="/admin/kyc/under-review" element={<KycReview initialStatus="under_review" />} />
        <Route path="/admin/kyc/:merchantId" element={<KycDetails />} />

        {/* Document Review */}
        <Route path="/admin/documents" element={<Documents />} />
        <Route path="/admin/documents/pending" element={<DocumentReview />} />
        <Route path="/admin/documents/:documentId" element={<DocumentReview />} />

        {/* Payment Gateways */}
        <Route path="/admin/gateways" element={<GatewayManagement />} />
        <Route path="/admin/gateways/services" element={<GatewayServices />} />
        <Route path="/admin/gateways/applications" element={<GatewayApplications />} />
        <Route path="/admin/gateways/:gatewayId" element={<GatewayDetails />} />

        {/* Institution Management */}
        <Route path="/admin/institutions" element={<BankManagement category="all" />} />
        <Route path="/admin/institutions/banks" element={<BankManagement category="banks" />} />
        <Route path="/admin/institutions/mfs" element={<BankManagement category="mfs" />} />
        <Route path="/admin/institutions/new" element={<AddBank />} />
        <Route path="/admin/institutions/services" element={<BankServices />} />
        <Route path="/admin/institutions/users" element={<BankUsers />} />
        <Route path="/admin/institutions/kyc-requirements" element={<BankKycRequirements />} />
        <Route path="/admin/institutions/kyc-requirements/new" element={<KycRequirementForm />} />
        <Route path="/admin/institutions/kyc-requirements/:id/edit" element={<KycRequirementForm />} />
        <Route path="/admin/institutions/settings" element={<BankSettings />} />
        <Route path="/admin/institutions/:institutionId" element={<BankDetails />} />
        <Route path="/admin/institutions/:institutionId/branches" element={<BankDetails />} />

        {/* Add-ons */}
        <Route path="/admin/addons" element={<AddonManagement />} />
        <Route path="/admin/addons/:addonId" element={<AddonDetails />} />

        {/* Orders & Payments */}
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/payments" element={<PaymentManagement />} />

        {/* Support */}
        <Route path="/admin/support" element={<SupportTickets />} />
        <Route path="/admin/support/:ticketId" element={<TicketDetails />} />

        {/* Notifications */}
        <Route path="/admin/notifications" element={<NotificationManagement />} />

        {/* Audit Trail */}
        <Route path="/admin/audit" element={<AuditLogs />} />

        {/* System Settings */}
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Admin Profile */}
        <Route path="/admin/profile" element={<AdminProfile />} />

        {/* Website CMS */}
        <Route path="/admin/cms" element={<CmsHomepage />} />

        {/* Contact Inquiries */}
        <Route path="/admin/contact-inquiries" element={<ContactInquiries />} />
      </Route>
    </Route>
  );
}
