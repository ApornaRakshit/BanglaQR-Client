import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Building2,
  ChevronLeft,
  ShieldCheck,
  User,
  Phone,
  Mail,
  CreditCard,
  FileText,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Eye,
  EyeOff,
  Layers,
  Activity,
  ArrowRight,
  ExternalLink,
  Ban,
  Check,
  X,
  Lock,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function MerchantDetails() {
  const { merchantId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Sensitive data unmask toggles
  const [showSensitiveKyc, setShowSensitiveKyc] = useState(false);

  // Modals for actions
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'reject' | 'request_info' | 'suspend' | 'activate'
  const [actionReason, setActionReason] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [requiredItems, setRequiredItems] = useState([]);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchMerchantData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, histRes] = await Promise.all([
        adminApi.getMerchant(merchantId),
        adminApi.getMerchantHistory(merchantId),
      ]);
      if (res.success) {
        setData(res.data);
      }
      if (histRes.success) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch merchant details:", err);
      setError("Unable to load merchant record. Please check if the merchant ID is valid.");
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchMerchantData();
  }, [fetchMerchantData]);

  const handleReviewAction = async (action) => {
    try {
      setSubmittingAction(true);
      setActionError(null);

      const payload = {
        action,
        reason: actionReason,
        comment: actionComment,
        requiredItems,
      };

      const res = await adminApi.reviewMerchant(merchantId, payload);
      if (res.success) {
        setActionModal(null);
        setActionReason("");
        setActionComment("");
        setRequiredItems([]);
        fetchMerchantData();
      }
    } catch (err) {
      console.error("Review action error:", err);
      setActionError(err?.response?.data?.message || "Failed to process review action.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDocumentReview = async (documentId, status, reviewComment = "") => {
    try {
      await adminApi.reviewDocument(merchantId, documentId, { status, reviewComment });
      fetchMerchantData();
    } catch (err) {
      console.error("Document review error:", err);
      alert("Failed to update document status: " + (err?.response?.data?.message || err.message));
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-slate-400">
        <RotateCw size={28} className="animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-semibold">Loading merchant profile & compliance documents...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={36} className="text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-slate-900">Merchant Record Unavailable</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{error || "Merchant not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/admin/merchants")}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
        >
          Back to Merchants Directory
        </button>
      </div>
    );
  }

  const { merchant, profile, contact, commercial, kyc, documents = [], services = [] } = data;

  const tabs = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "company", label: "Company Profile", icon: Building2 },
    { key: "contact", label: "Contact Person", icon: User },
    { key: "commercial", label: "Commercial Details", icon: CreditCard },
    { key: "kyc", label: "KYC & Banking", icon: ShieldCheck },
    { key: "documents", label: `Documents (${documents.length})`, icon: FileText },
    { key: "services", label: `Services (${services.length})`, icon: Layers },
    { key: "history", label: "Audit & History", icon: Activity },
  ];

  const accountStatusBadges = {
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-indigo-50 text-indigo-700 border-indigo-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    suspended: "bg-amber-50 text-amber-800 border-amber-200",
    additional_information_required: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Go Back"
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-950">
                {profile?.companyName || kyc?.legalBusinessName || "Merchant Details"}
              </h1>
              <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {merchant.merchantCode}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Registered on {new Date(merchant.createdAt).toLocaleDateString()} • {merchant.user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {merchant.accountStatus === "submitted" && (
            <button
              type="button"
              onClick={() => handleReviewAction("start_review")}
              disabled={submittingAction}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              <Clock size={14} />
              <span>Start Review</span>
            </button>
          )}

          {merchant.accountStatus !== "approved" && merchant.accountStatus !== "active" && (
            <>
              <button
                type="button"
                onClick={() => setActionModal("request_info")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
              >
                <AlertTriangle size={14} className="text-amber-700" />
                <span>Request Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActionModal("reject")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => setActionModal("approve")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Approve Merchant</span>
              </button>
            </>
          )}

          {merchant.accountStatus === "approved" && (
            <button
              type="button"
              onClick={() => handleReviewAction("activate")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>Set to Active</span>
            </button>
          )}

          {merchant.accountStatus === "active" && (
            <button
              type="button"
              onClick={() => setActionModal("suspend")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
            >
              <Ban size={14} />
              <span>Suspend Account</span>
            </button>
          )}

          {merchant.accountStatus === "suspended" && (
            <button
              type="button"
              onClick={() => handleReviewAction("activate")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>Reactivate Merchant</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-1 pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3.5 text-sm font-bold border-b-2 transition ${
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status Metric Strip */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account Status
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-sm font-bold uppercase tracking-wider ${
                    accountStatusBadges[merchant.accountStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {merchant.accountStatus?.replace(/_/g, " ")}
                </span>
                <ShieldCheck size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {merchant.submittedAt ? `Submitted on ${new Date(merchant.submittedAt).toLocaleDateString()}` : "Not submitted yet"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                KYC Status
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-sm font-bold uppercase tracking-wider ${
                    accountStatusBadges[merchant.kycStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {merchant.kycStatus?.replace(/_/g, " ")}
                </span>
                <User size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {kyc?.legalBusinessName ? "KYC details provided" : "Pending KYC submission"}
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
                {documents.filter((d) => d.status === "Approved").length} approved of {documents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Gateways
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xl font-extrabold text-slate-900">{services.length} Services</p>
                <CreditCard size={20} className="text-slate-400" />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">BanglaQR multi-gateway acquiring</p>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Company & Contact Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Business & Contact Snapshot
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">Company Name</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{profile?.companyName || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Business Type</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{profile?.businessType || kyc?.businessEntityType || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Person</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{contact?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Email</dt>
                  <dd className="font-bold text-slate-900 mt-0.5 truncate">{contact?.email || merchant.user.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Contact Phone</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{contact?.phone || merchant.user.phone || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Location</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{profile?.city ? `${profile.city}, Bangladesh` : "Dhaka, Bangladesh"}</dd>
                </div>
              </dl>
            </div>

            {/* Banking & Settlement Snapshot */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Settlement & Banking Snapshot
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-400 font-medium">Settlement Bank</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{kyc?.bankName || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Title</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{kyc?.bankAccountName || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Number</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">
                    {showSensitiveKyc ? kyc?.rawBankAccountNumber || "N/A" : kyc?.bankAccountNumber || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Routing Number</dt>
                  <dd className="font-mono font-bold text-slate-900 mt-0.5">{kyc?.routingNumber || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Branch</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{kyc?.branchName || "Main Branch"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Account Type</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{kyc?.accountType || "Current"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Information */}
      {activeTab === "company" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Registered Company Profile
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Company Name</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{profile?.companyName || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Business Entity Type</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{profile?.businessType || kyc?.businessEntityType || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Industry Sector</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{profile?.industry || "Financial Technology"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Official Website</span>
              <p className="mt-1 text-sm font-bold text-emerald-600 truncate">{profile?.website || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 font-medium">Physical Business Address</span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.address ? `${profile.address}, ${profile.city || ""}, ${profile.state || ""}` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Person */}
      {activeTab === "contact" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Authorized Contact Representative
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Representative Name</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{contact?.name || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Designation / Role</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{contact?.designation || "Authorized Signatory"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Email Address</span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">{contact?.email || merchant.user.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Phone Number</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{contact?.phone || merchant.user.phone || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Commercial Details */}
      {activeTab === "commercial" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Commercial & Transaction Projections
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Transactions Per Day</span>
              <p className="mt-1 text-base font-extrabold text-slate-900">{commercial?.transactionsPerDay ?? "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Transactions Per Month</span>
              <p className="mt-1 text-base font-extrabold text-slate-900">{commercial?.transactionsPerMonth ?? "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Maximum Ticket Size (BDT)</span>
              <p className="mt-1 text-base font-extrabold text-emerald-700">
                {commercial?.maximumTicketSize ? `৳ ${Number(commercial.maximumTicketSize).toLocaleString()}` : "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
              <span className="text-slate-400 font-medium">Payment Callback / Return URL</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800 break-all">{commercial?.returnUrl || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-slate-400 font-medium">Whitelisted IP Address</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">{commercial?.merchantIpAddress || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: KYC & Banking */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
            <div>
              <h4 className="font-bold text-sm">KYC & Compliance Verification</h4>
              <p className="text-sm text-slate-400">National ID, Trade License & Bank verification records.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSensitiveKyc((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-700 transition cursor-pointer"
            >
              {showSensitiveKyc ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showSensitiveKyc ? "Mask Sensitive" : "Reveal Numbers"}</span>
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Legal Entity Details */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Entity Legal Identifiers
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Legal Business Name:</dt>
                  <dd className="font-bold text-slate-900">{kyc?.legalBusinessName || "N/A"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Trade License Number:</dt>
                  <dd className="font-mono font-bold text-slate-900">{kyc?.tradeLicenseNumber || "N/A"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">e-TIN Number:</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {showSensitiveKyc ? kyc?.rawTin || "N/A" : kyc?.tin || "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">BIN / VAT Number:</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {showSensitiveKyc ? kyc?.rawBin || "Optional" : kyc?.bin || "Optional"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Authorized Person NID:</dt>
                  <dd className="font-mono font-bold text-emerald-700">
                    {showSensitiveKyc ? kyc?.rawNid || "N/A" : kyc?.nidNumber || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Bank Details */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Settlement Bank Credentials
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Bank Name:</dt>
                  <dd className="font-bold text-slate-900">{kyc?.bankName || "N/A"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Bank Account Name:</dt>
                  <dd className="font-bold text-slate-900">{kyc?.bankAccountName || "N/A"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Account Number:</dt>
                  <dd className="font-mono font-bold text-emerald-700">
                    {showSensitiveKyc ? kyc?.rawBankAccountNumber || "N/A" : kyc?.bankAccountNumber || "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Branch Name:</dt>
                  <dd className="font-bold text-slate-900">{kyc?.branchName || "N/A"}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <dt className="text-slate-500 font-medium">Routing Number:</dt>
                  <dd className="font-mono font-bold text-slate-900">{kyc?.routingNumber || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Compliance Documents */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Uploaded Compliance Documents</h3>
              <p className="text-sm text-slate-500">Securely stored and verified documents.</p>
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
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{doc.documentName}</p>
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {doc.documentType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Uploaded on {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()} • {Math.round(doc.fileSize / 1024)} KB
                      </p>
                      {doc.reviewComment && (
                        <p className="text-[11px] text-slate-600 mt-1 italic bg-slate-50 px-2 py-0.5 rounded inline-block">
                          Note: {doc.reviewComment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        doc.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : doc.status === "Rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {doc.status}
                    </span>

                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => setViewingDoc(doc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Eye size={13} className="text-slate-400" />
                      <span>View</span>
                    </button>

                    {/* Quick Document Approve */}
                    {doc.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => handleDocumentReview(doc.id, "Approved", "Verified by reviewer")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-sm font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Quick Document Reject */}
                    {doc.status !== "Rejected" && (
                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt("Enter rejection reason for this document:", "Document is unreadable or mismatched");
                          if (note) handleDocumentReview(doc.id, "Rejected", note);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-sm font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Services & Gateways */}
      {activeTab === "services" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
            Assigned Payment Gateway Services
          </h3>
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Layers size={32} className="mb-2" />
              <p className="text-sm font-semibold">No gateway services provisioned for this merchant yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Standard BanglaQR acquiring gateway will be assigned upon final compliance approval.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{s.gatewayName}</h4>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Service Type: {s.serviceType}</p>
                  <p className="text-sm text-slate-500">Service Fee: {s.serviceFee}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Audit & Onboarding Trail */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-4">
              Onboarding & Compliance History
            </h3>
            {history?.onboardingHistory?.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No onboarding events recorded.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {history?.onboardingHistory?.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm border-b border-slate-50 pb-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        {h.action.replace(/_/g, " ").toUpperCase()} ({h.step})
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Status changed from <span className="font-semibold">{h.previousStatus}</span> to{" "}
                        <span className="font-semibold">{h.newStatus}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          ACTION MODALS (Approve, Reject, Request Info)
      ====================================================== */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setActionModal(null);
                setActionError(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <h3 className="text-base font-bold text-slate-950">
              {actionModal === "approve" && "Confirm Merchant Application Approval"}
              {actionModal === "reject" && "Reject Merchant Application"}
              {actionModal === "request_info" && "Request Additional Information"}
              {actionModal === "suspend" && "Suspend Merchant Account"}
            </h3>

            {actionError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                {actionError}
              </div>
            )}

            {/* Modal Form Content */}
            <div className="mt-4 space-y-4 text-sm">
              {actionModal === "approve" && (
                <div className="space-y-3">
                  <p className="text-slate-600 leading-5">
                    Are you sure you want to approve merchant{" "}
                    <span className="font-bold text-slate-900">{profile?.companyName || merchant.merchantCode}</span>?
                    This will finalize KYC compliance and authorize payment gateway provisioning.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Approval Note (Optional)
                    </label>
                    <textarea
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      placeholder="Add compliance notes..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {actionModal === "reject" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">Select Reason</option>
                      <option value="Invalid Document">Invalid or Forged Document</option>
                      <option value="KYC Mismatch">KYC Identity Mismatch</option>
                      <option value="Incomplete Application">Incomplete Legal Application</option>
                      <option value="Business Information Mismatch">Business Information Mismatch</option>
                      <option value="Compliance Policy Violation">Compliance Policy Violation</option>
                      <option value="Other">Other Reason</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Detailed Explanation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      placeholder="Explain the rejection reason clearly for merchant notification..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {actionModal === "request_info" && (
                <div className="space-y-3">
                  <p className="text-slate-600">Select the sections or files that require merchant update:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {[
                      "Company Information",
                      "Contact Details",
                      "Commercial Projections",
                      "KYC Legal Details",
                      "NID Front Document",
                      "NID Back Document",
                      "TIN Certificate",
                      "Cancelled Bank Cheque",
                      "Trade License",
                      "BIN Certificate",
                    ].map((item) => (
                      <label key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requiredItems.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRequiredItems((prev) => [...prev, item]);
                            } else {
                              setRequiredItems((prev) => prev.filter((i) => i !== item));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded accent-emerald-600"
                        />
                        <span className="text-[11px] font-medium text-slate-800">{item}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Instructions for Merchant
                    </label>
                    <textarea
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      placeholder="Provide clear correction instructions..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {actionModal === "suspend" && (
                <div className="space-y-3">
                  <p className="text-slate-600">Are you sure you want to suspend this merchant account?</p>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder="Reason for suspension..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleReviewAction(actionModal)}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition cursor-pointer ${
                  actionModal === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : actionModal === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {submittingAction ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SECURE DOCUMENT VIEWER MODAL
      ====================================================== */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Viewer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm text-white truncate">{viewingDoc.documentName}</h4>
                  <p className="text-[10px] text-slate-400">{viewingDoc.documentType}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-slate-900/50 flex items-center justify-center p-4 overflow-auto">
              {viewingDoc.mimeType?.includes("pdf") ? (
                <iframe
                  src={adminApi.getDocumentViewUrl(merchantId, viewingDoc.id)}
                  title={viewingDoc.documentName}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <img
                  src={adminApi.getDocumentViewUrl(merchantId, viewingDoc.id)}
                  alt={viewingDoc.documentName}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                />
              )}
            </div>

            {/* Viewer Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-5 py-3 text-sm">
              <span className="text-slate-400">Current Status: <span className="font-bold text-white">{viewingDoc.status}</span></span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDocumentReview(viewingDoc.id, "Approved", "Verified in viewer");
                    setViewingDoc(null);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Approve Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const note = prompt("Enter rejection reason:", "Document is unreadable or expired");
                    if (note) {
                      handleDocumentReview(viewingDoc.id, "Rejected", note);
                      setViewingDoc(null);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700 transition cursor-pointer"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

