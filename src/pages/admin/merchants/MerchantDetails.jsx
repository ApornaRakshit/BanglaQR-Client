import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
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
  Landmark,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import MerchantAuditDetailTabs from "../../../components/shared/MerchantAuditDetailTabs";
import SecureDocumentViewerModal from "../../../components/shared/SecureDocumentViewerModal";

export default function MerchantDetails() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [data, setData] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    if (newTab === "overview") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", newTab);
    }
    setSearchParams(newParams, { replace: true });
  };

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

      const normalizedAction = action === "request_info" ? "request_information" : action;
      const payload = {
        action: normalizedAction,
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

  const { merchant, profile, contact, commercial, kyc, documents = [], services = [], fieldIssues = [], applications = [], versions = [] } = data;

  const tabs = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "kyc", label: "KYC & Banking", icon: ShieldCheck },
    { key: "documents", label: `Documents (${documents.length})`, icon: FileText },
    { key: "applications", label: `Institution Review (${applications.length})`, icon: Landmark },
    { key: "company", label: "Company Profile", icon: Building2 },
    { key: "contact", label: "Contact Person", icon: User },
    { key: "commercial", label: "Commercial Details", icon: CreditCard },
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
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(initialTab === "kyc" ? "/admin/kyc" : "/admin/merchants");
              }
            }}
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

      {/* Unified Merchant and KYC Audit Detail Tabs Component */}
      <MerchantAuditDetailTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        merchant={merchant}
        profile={profile}
        contact={contact}
        commercial={commercial}
        kyc={kyc}
        documents={documents}
        fieldIssues={fieldIssues}
        services={services}
        applications={applications}
        versions={versions}
        history={history?.onboardingHistory || []}
        onViewDoc={(doc) => setViewingDoc(doc)}
        onDocApprove={(docId) => handleDocumentReview(docId, "Approved", "Verified by administrator")}
        onDocReject={(docId) => {
          const note = prompt("Enter rejection reason for this document:", "Document is unreadable or mismatched");
          if (note) handleDocumentReview(docId, "Rejected", note);
        }}
        role="admin"
      />

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

      {/* Secure Document Preview Modal */}
      {viewingDoc && (
        <SecureDocumentViewerModal
          doc={viewingDoc}
          viewUrl={adminApi.getDocumentViewUrl(merchantId, viewingDoc.id)}
          blobFetcher={() => adminApi.getDocumentBlob(merchantId, viewingDoc.id)}
          onClose={() => setViewingDoc(null)}
          onFlagCorrection={(doc) => {
            setActionModal("request_info");
            const docLabel = doc.document_name || doc.documentName || doc.document_type || doc.documentType;
            if (docLabel && !requiredItems.includes(docLabel)) {
              setRequiredItems((prev) => [...prev, docLabel]);
            }
          }}
        />
      )}
    </div>
  );
}

