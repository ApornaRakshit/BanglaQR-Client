import { useState } from "react";
import {
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  FileText,
  Layers,
  Activity,
  Landmark,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

export default function MerchantAuditDetailTabs({
  activeTab,
  onTabChange,
  merchant,
  profile,
  contact,
  commercial,
  kyc,
  documents = [],
  fieldIssues = [],
  services = [],
  applications = [],
  versions = [],
  history = [],
  onViewDoc,
  onDocApprove,
  onDocReject,
  onFlagDocCorrection,
  role = "admin", // "admin" | "institution"
}) {
  const [showSensitiveKyc, setShowSensitiveKyc] = useState(false);

  // Group issues into open and resolved/resubmitted
  const openIssues = (fieldIssues || []).filter((i) => i.status === "open");
  const resubmittedIssues = (fieldIssues || []).filter((i) => i.status === "resolved");

  // Helper to find issue for a specific field
  const getFieldIssue = (fieldKey) => {
    const key = String(fieldKey || "").toLowerCase();
    return (fieldIssues || []).find((i) => {
      const issueKey = String(i.field_key || i.fieldKey || "").toLowerCase();
      return issueKey === key || issueKey.includes(key) || key.includes(issueKey);
    });
  };

  const accountStatusBadges = {
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-amber-50 text-amber-800 border-amber-200",
    additional_information_required: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "company", label: "Company Profile", icon: Building2 },
    { key: "contact", label: "Contact Person", icon: User },
    { key: "commercial", label: "Commercial Details", icon: CreditCard },
    {
      key: "kyc",
      label: "KYC & Banking",
      icon: ShieldCheck,
      badge: resubmittedIssues.some((i) => {
        const k = String(i.field_key || "").toLowerCase();
        return !k.includes("document") && !k.includes("front") && !k.includes("back");
      }) ? "Updated" : null,
    },
    {
      key: "documents",
      label: `Documents (${documents.length})`,
      icon: FileText,
      badge: resubmittedIssues.some((i) => {
        const k = String(i.field_key || "").toLowerCase();
        return k.includes("front") || k.includes("back") || k.includes("cheque") || k.includes("document");
      }) ? "New Upload" : null,
    },
    { key: "services", label: `Services (${services.length})`, icon: Layers },
    ...(role === "admin" && applications.length > 0
      ? [{ key: "applications", label: `Institution Review (${applications.length})`, icon: Landmark }]
      : []),
    { key: "history", label: "Audit & History", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-[#00875a] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white text-emerald-900" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ====================================================
          TAB 1: OVERVIEW
      ==================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Notification Alert Banner for Resubmitted Corrections */}
          {resubmittedIssues.length > 0 && (
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/30 to-white p-5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Merchant Resubmission Notification
                    </span>
                    <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
                      {resubmittedIssues.length} Item{resubmittedIssues.length > 1 ? "s" : ""} Corrected & Resubmitted
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                    Merchant has re-uploaded documents / corrected requested fields
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    The merchant addressed the compliance correction requests below. Please audit the updated data and documents against previous values.
                  </p>

                  <div className="mt-3 divide-y divide-emerald-100 rounded-xl border border-emerald-200 bg-white p-3 space-y-2">
                    {resubmittedIssues.map((issue) => (
                      <div key={issue.id} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase shrink-0">
                            {(issue.field_key || issue.fieldKey || "").replace(/_/g, " ")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-slate-500">
                              <span className="font-semibold text-slate-700">Requested Correction:</span>{" "}
                              {issue.issue_reason || issue.issueReason}
                            </p>
                            <p className="text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>Resubmitted:</span>{" "}
                              <span className="italic">{issue.resolution_note || issue.resolutionNote || "Updated by merchant"}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {issue.updated_at || issue.updatedAt ? new Date(issue.updated_at || issue.updatedAt).toLocaleString() : "Recently"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Banner for Open / Pending Corrections */}
          {openIssues.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/30 to-white p-5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Pending Compliance Corrections
                    </span>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                      {openIssues.length} Unresolved Issue{openIssues.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                    Awaiting Merchant Corrections
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {openIssues.map((issue) => (
                      <span
                        key={issue.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900"
                      >
                        <span className="font-bold capitalize">{(issue.field_key || issue.fieldKey || "").replace(/_/g, " ")}:</span>
                        <span className="text-slate-600">{issue.issue_reason || issue.issueReason}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Metric Strip */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Application / Account Status
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-sm font-bold uppercase tracking-wider ${
                    accountStatusBadges[merchant?.accountStatus || merchant?.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {(merchant?.accountStatus || merchant?.status || "draft")?.replace(/_/g, " ")}
                </span>
                <ShieldCheck size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {merchant?.submittedAt || merchant?.appliedAt || merchant?.created_at
                  ? `Submitted on ${new Date(merchant.submittedAt || merchant.appliedAt || merchant.created_at).toLocaleDateString()}`
                  : "Not submitted yet"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                KYC Verification Status
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-sm font-bold uppercase tracking-wider ${
                    accountStatusBadges[merchant?.kycStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {(merchant?.kycStatus || merchant?.status || "under_review")?.replace(/_/g, " ")}
                </span>
                <User size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {kyc?.legalBusinessName || kyc?.legal_business_name ? "KYC details provided" : "Pending KYC submission"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Compliance Documents
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xl font-extrabold text-slate-900">{documents.length} Files</p>
                <FileText size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {documents.filter((d) => d.status === "Approved" || d.status === "approved").length} approved of {documents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Requested Services
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xl font-extrabold text-slate-900">
                  {services.length || (merchant?.gateway_name ? 1 : 0)} Services
                </p>
                <CreditCard size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {merchant?.gateway_name || "BanglaQR Gateway"}
              </p>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Business Snapshot */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Business & Contact Snapshot
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">Company Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile?.companyName || profile?.company_name || merchant?.business_name || kyc?.legalBusinessName || kyc?.legal_business_name || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Business Type</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile?.businessType || profile?.business_type || kyc?.businessEntityType || kyc?.business_entity_type || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Person</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {contact?.name || kyc?.authorizedPersonName || kyc?.authorized_person_name || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Email</dt>
                  <dd className="font-bold text-slate-900 mt-0.5 truncate">
                    {contact?.email || merchant?.merchant_email || merchant?.user?.email || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Phone</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {contact?.phone || merchant?.merchant_phone || merchant?.user?.phone || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Location</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {profile?.city || profile?.district ? `${profile.city || profile.district}, Bangladesh` : "Dhaka, Bangladesh"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Banking Snapshot */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Settlement & Banking Snapshot
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">Settlement Bank</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {kyc?.bankName || kyc?.bank_name || merchant?.gateway_name || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Title</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {kyc?.bankAccountName || kyc?.bank_account_name || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Number</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    {kyc?.bankAccountNumber || kyc?.bank_account_number || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Routing Number</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    {kyc?.routingNumber || kyc?.routing_number || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Branch</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {kyc?.branchName || kyc?.branch_name || merchant?.branch_name || "Main Branch"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Type</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">
                    {kyc?.accountType || kyc?.account_type || "Business Current"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: COMPANY PROFILE
      ==================================================== */}
      {activeTab === "company" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Registered Company Profile
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Company Name</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.companyName || profile?.company_name || merchant?.business_name || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Business Entity Type</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.businessType || profile?.business_type || kyc?.businessEntityType || kyc?.business_entity_type || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Industry Sector</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.industry || "Retail & E-Commerce"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Official Website</span>
              <p className="mt-1 text-sm font-bold text-emerald-600 truncate">
                {profile?.website || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 font-medium">Physical Business Address</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.address
                  ? `${profile.address}, ${profile.city || profile.district || ""}, ${profile.state || ""}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: CONTACT PERSON
      ==================================================== */}
      {activeTab === "contact" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Authorized Contact Representative
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Representative Name</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {contact?.name || kyc?.authorizedPersonName || kyc?.authorized_person_name || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Designation / Role</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {contact?.designation || kyc?.designation || "Authorized Signatory"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Email Address</span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {contact?.email || merchant?.merchant_email || merchant?.user?.email || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Phone Number</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {contact?.phone || merchant?.merchant_phone || merchant?.user?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: COMMERCIAL DETAILS
      ==================================================== */}
      {activeTab === "commercial" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Commercial & Transaction Projections
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Transactions Per Day</span>
              <p className="mt-1 text-base font-extrabold text-slate-900">
                {commercial?.transactionsPerDay ?? commercial?.transactions_per_day ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Transactions Per Month</span>
              <p className="mt-1 text-base font-extrabold text-slate-900">
                {commercial?.transactionsPerMonth ?? commercial?.transactions_per_month ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Maximum Ticket Size (BDT)</span>
              <p className="mt-1 text-base font-extrabold text-emerald-700">
                {commercial?.maximumTicketSize || commercial?.maximum_ticket_size
                  ? `৳ ${Number(commercial.maximumTicketSize || commercial.maximum_ticket_size).toLocaleString()}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 font-medium">Payment Callback / Return URL</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800 break-all">
                {commercial?.returnUrl || commercial?.return_url || "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Whitelisted IP Address</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                {commercial?.merchantIpAddress || commercial?.merchant_ip_address || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: KYC & BANKING
      ==================================================== */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
            <div>
              <h4 className="font-bold text-sm">KYC & Compliance Verification</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                National ID, Trade License, e-TIN & Settlement bank verification records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSensitiveKyc((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              {showSensitiveKyc ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showSensitiveKyc ? "Mask Sensitive" : "Reveal Numbers"}</span>
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Legal Entity Details */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Entity Legal Identifiers</span>
                <span className="text-[11px] font-normal text-slate-400">Verified official registration</span>
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {/* Legal Business Name */}
                {(() => {
                  const issue = getFieldIssue("legal_business_name") || getFieldIssue("legalBusinessName");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>Legal Business Name:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                          {isOpen && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full animate-pulse">
                              Correction Needed
                            </span>
                          )}
                        </dt>
                        <dd className="font-bold text-slate-900">
                          {kyc?.legalBusinessName || kyc?.legal_business_name || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Trade License Number */}
                {(() => {
                  const issue = getFieldIssue("trade_license_number") || getFieldIssue("tradeLicenseNumber") || getFieldIssue("trade_license");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>Trade License Number:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                          {isOpen && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full animate-pulse">
                              Correction Needed
                            </span>
                          )}
                        </dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {kyc?.tradeLicenseNumber || kyc?.trade_license_number || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* e-TIN Number */}
                {(() => {
                  const issue = getFieldIssue("tin") || getFieldIssue("tin_certificate");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>e-TIN Number:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                          {isOpen && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full animate-pulse">
                              Correction Needed
                            </span>
                          )}
                        </dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {showSensitiveKyc
                            ? kyc?.rawTin || kyc?.tin || "N/A"
                            : kyc?.tin || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* BIN / VAT Number */}
                {(() => {
                  const issue = getFieldIssue("bin") || getFieldIssue("bin_certificate");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>BIN / VAT Number:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                        </dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {showSensitiveKyc
                            ? kyc?.rawBin || kyc?.bin || "Optional"
                            : kyc?.bin || "Optional"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Authorized Person NID */}
                {(() => {
                  const issue = getFieldIssue("nid_number") || getFieldIssue("nidNumber") || getFieldIssue("nid");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>Authorized Person NID:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                          {isOpen && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-full animate-pulse">
                              Correction Needed
                            </span>
                          )}
                        </dt>
                        <dd className="font-mono font-bold text-emerald-700">
                          {showSensitiveKyc
                            ? kyc?.rawNid || kyc?.nid_number || "N/A"
                            : kyc?.nidNumber || kyc?.nid_number || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </dl>
            </div>

            {/* Bank Details */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Settlement Bank Credentials</span>
                <span className="text-[11px] font-normal text-slate-400">Merchant payout account</span>
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Bank Name:</dt>
                  <dd className="font-bold text-slate-900">
                    {kyc?.bankName || kyc?.bank_name || merchant?.gateway_name || "N/A"}
                  </dd>
                </div>

                {/* Account Name */}
                {(() => {
                  const issue = getFieldIssue("bank_account_name") || getFieldIssue("account_name") || getFieldIssue("accountHolderName");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>Bank Account Name:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                        </dt>
                        <dd className="font-bold text-slate-900">
                          {kyc?.bankAccountName || kyc?.bank_account_name || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Account Number */}
                {(() => {
                  const issue = getFieldIssue("bank_account_number") || getFieldIssue("account_number") || getFieldIssue("accountNumber");
                  const isResubmitted = issue && issue.status === "resolved";
                  const isOpen = issue && issue.status === "open";
                  return (
                    <div className={`p-2 rounded-xl transition-all ${
                      isOpen
                        ? "bg-amber-50/80 border border-amber-300 ring-1 ring-amber-300"
                        : isResubmitted
                        ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                        : "py-1 border-b border-slate-50"
                    }`}>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500 font-medium flex items-center gap-1.5">
                          <span>Account Number:</span>
                          {isResubmitted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              <Sparkles size={10} />
                              Resubmitted
                            </span>
                          )}
                        </dt>
                        <dd className="font-mono font-bold text-emerald-700">
                          {showSensitiveKyc
                            ? kyc?.rawBankAccountNumber || kyc?.bank_account_number || "N/A"
                            : kyc?.bankAccountNumber || kyc?.bank_account_number || "N/A"}
                        </dd>
                      </div>
                      {isResubmitted && (
                        <div className="mt-1 text-[11px] text-emerald-800 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold text-slate-600">Review Note:</span> {issue.issue_reason || issue.issueReason} •{" "}
                          <span className="font-semibold text-emerald-700">Resubmitted:</span> {issue.resolution_note || issue.resolutionNote}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Branch Name:</dt>
                  <dd className="font-bold text-slate-900">
                    {kyc?.branchName || kyc?.branch_name || merchant?.branch_name || "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Routing Number:</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {kyc?.routingNumber || kyc?.routing_number || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 6: COMPLIANCE DOCUMENTS
      ==================================================== */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Uploaded Compliance Documents</h3>
              <p className="text-sm text-slate-500">Securely stored and verified verification documents.</p>
            </div>
            <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {documents.length} Files Total
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <FileText size={32} className="mb-2" />
              <p className="text-sm font-semibold">No documents uploaded by merchant yet.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {documents.map((doc) => {
                const docName = doc.document_name || doc.documentName || doc.custom_label || doc.document_type || doc.documentType;
                const docType = doc.document_type || doc.documentType;
                const docStatus = doc.status || "Uploaded";
                const fileSize = doc.file_size || doc.fileSize;
                const uploadDate = doc.uploaded_at || doc.uploadedAt || doc.created_at || doc.createdAt;

                // Match with issues for this document type
                const docIssue = (fieldIssues || []).find((i) => {
                  const k = String(i.field_key || i.fieldKey || "").toLowerCase();
                  const r = String(i.issue_reason || i.issueReason || "").toLowerCase();
                  const t = String(docType || "").toLowerCase();
                  return (
                    k === t ||
                    k.includes(t) ||
                    (t.includes("nid") && (k.includes("nid") || r.includes("nid"))) ||
                    (t.includes("trade") && k.includes("trade")) ||
                    (t.includes("tin") && k.includes("tin")) ||
                    (t.includes("cheque") && k.includes("cheque")) ||
                    (t.includes("bin") && k.includes("bin"))
                  );
                });

                const isResolved = docIssue && docIssue.status === "resolved";
                const isOpen = docIssue && docIssue.status === "open";

                return (
                  <div
                    key={doc.id}
                    className={`py-4 px-3 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                      isResolved
                        ? "bg-emerald-50/50 border border-emerald-200 my-2 shadow-2xs"
                        : isOpen
                        ? "bg-amber-50/50 border border-amber-300 my-2"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isResolved ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate capitalize">{docName}</p>
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 uppercase">
                            {docType}
                          </span>
                          {isResolved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                              <Sparkles size={11} className="text-emerald-600" />
                              <span>Replaced & Resubmitted</span>
                            </span>
                          )}
                          {isOpen && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                              <AlertTriangle size={11} className="text-amber-700" />
                              <span>Correction Requested</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Uploaded on {uploadDate ? new Date(uploadDate).toLocaleString() : "N/A"} •{" "}
                          {fileSize ? `${Math.round(fileSize / 1024)} KB` : "File"}
                          {doc.original_filename || doc.originalFilename ? (
                            <span className="font-mono text-slate-500 ml-1 truncate">
                              ({doc.original_filename || doc.originalFilename})
                            </span>
                          ) : null}
                        </p>

                        {/* Review issue note and resolution trail */}
                        {docIssue && (
                          <div className={`mt-2 text-xs p-2.5 rounded-xl border ${
                            isResolved
                              ? "bg-white text-emerald-900 border-emerald-200"
                              : "bg-white text-amber-900 border-amber-200"
                          }`}>
                            <p className="text-slate-600">
                              <span className="font-bold">Compliance Requested:</span> {docIssue.issue_reason || docIssue.issueReason}
                            </p>
                            {isResolved && (
                              <p className="text-emerald-800 font-medium mt-1 flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span>Merchant Action: {docIssue.resolution_note || docIssue.resolutionNote || "New clear file uploaded"}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({docIssue.updated_at || docIssue.updatedAt ? new Date(docIssue.updated_at || docIssue.updatedAt).toLocaleDateString() : "Recent"})
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {doc.review_comment || doc.reviewComment ? (
                          <p className="text-[11px] text-slate-600 mt-1 italic bg-slate-50 px-2 py-0.5 rounded inline-block">
                            Note: {doc.review_comment || doc.reviewComment}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          docStatus.toLowerCase() === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : docStatus.toLowerCase() === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {docStatus}
                      </span>

                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() => onViewDoc(doc)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Eye size={13} className="text-slate-400" />
                        <span>View</span>
                      </button>

                      {/* Role Specific Actions: Admin Document Approval */}
                      {role === "admin" && onDocApprove && docStatus.toLowerCase() !== "approved" && (
                        <button
                          type="button"
                          onClick={() => onDocApprove(doc.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {/* Role Specific Actions: Admin Document Reject */}
                      {role === "admin" && onDocReject && docStatus.toLowerCase() !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => onDocReject(doc.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      {/* Institution / Bank Role: Flag correction */}
                      {onFlagDocCorrection && (
                        <button
                          type="button"
                          onClick={() => onFlagDocCorrection(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                          title="Request correction on this document"
                        >
                          <AlertTriangle size={12} />
                          <span>Flag Fix</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB: INSTITUTION APPLICATIONS (Admin View)
      ==================================================== */}
      {activeTab === "applications" && role === "admin" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Partner Bank / MFS Review Applications</h3>
                <p className="text-sm text-slate-500">Track institution review decisions, assigned reviewer notes, and version snapshots.</p>
              </div>
              <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {applications.length} Record(s)
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Landmark size={32} className="mb-2" />
                <p className="text-sm font-semibold">No institution application submitted yet.</p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{app.applicationNumber || app.application_number}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {app.applicationType === "onboarding_kyc" || app.application_type === "onboarding_kyc" ? "Initial Onboarding KYC" : "Gateway Service"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Designated Bank: <span className="text-emerald-700">{app.institutionName || app.institution_name || app.gateway_name || "Partner Bank"}</span>
                        {(app.branchName || app.branch_name) && <span className="text-slate-500 font-normal"> • Branch: {app.branchName || app.branch_name}</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        Applied on: {app.appliedAt || app.applied_at ? new Date(app.appliedAt || app.applied_at).toLocaleString() : "N/A"}
                        {(app.reviewedAt || app.reviewed_at) && ` • Bank Reviewed: ${new Date(app.reviewedAt || app.reviewed_at).toLocaleString()}`}
                      </p>
                      {(app.reviewComment || app.review_comment) && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          <span className="font-bold">Bank Comment:</span> {app.reviewComment || app.review_comment}
                        </p>
                      )}
                      {(app.rejectionReason || app.rejection_reason) && (
                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-100 mt-1">
                          <span className="font-bold">Rejection Reason:</span> {app.rejectionReason || app.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                          app.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : app.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : app.status === "additional_information_required"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {app.status === "approved"
                          ? "Bank Approved • Awaiting Admin"
                          : app.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 7: SERVICES
      ==================================================== */}
      {activeTab === "services" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Assigned Payment Gateway & Services
          </h3>
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Layers size={32} className="mb-2" />
              <p className="text-sm font-semibold">
                {merchant?.gateway_name
                  ? `Designated Partner: ${merchant.gateway_name}`
                  : "No gateway services provisioned for this merchant yet."}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Standard BanglaQR acquiring gateway services activate upon final platform approval.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{s.gatewayName || s.gateway_name}</h4>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Service Type: {s.serviceType || s.service_type || "Merchant Acquiring"}</p>
                  <p className="text-sm text-slate-500">Service Fee: {s.serviceFee || s.service_fee || 0}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 8: AUDIT & HISTORY
      ==================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Submission Versions Snapshot */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
              KYC Submission Versions & Audit Snapshots
            </h3>
            {versions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">Version 1 (Initial Submission Snapshot)</p>
            ) : (
              <div className="mt-4 space-y-3">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">
                        Version #{ver.versionNo || ver.version_no}
                      </span>
                      <p className="text-slate-500 mt-0.5">{ver.changeSummary || ver.change_summary || "KYC onboarding data submission"}</p>
                    </div>
                    <span className="text-slate-400 font-mono">
                      {new Date(ver.submittedAt || ver.submitted_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding Event Trail */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
              Onboarding & Compliance History Trail
            </h3>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No onboarding events recorded.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm border-b border-slate-50 pb-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        {(h.action || "STATUS_CHANGE").replace(/_/g, " ").toUpperCase()} {h.step ? `(${h.step})` : ""}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Status changed from <span className="font-semibold">{h.previousStatus || h.previous_status || "N/A"}</span> to{" "}
                        <span className="font-semibold">{h.newStatus || h.new_status || "N/A"}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(h.createdAt || h.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

