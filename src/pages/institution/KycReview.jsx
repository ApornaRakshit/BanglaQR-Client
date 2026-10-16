import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import {
  FileCheck2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  Eye,
  ShieldCheck,
  Send,
  Loader2,
  Check,
  X,
  History,
  Layers,
  Landmark,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";
import MerchantAuditDetailTabs from "../../components/shared/MerchantAuditDetailTabs";
import SecureDocumentViewerModal from "../../components/shared/SecureDocumentViewerModal";

const COMMON_KYC_FIELDS = [
  // Key Documents
  { key: "nid_front", label: "National ID (NID) Front Side Document" },
  { key: "nid_back", label: "National ID (NID) Back Side Document" },
  { key: "trade_license", label: "Trade License Document / Copy" },
  { key: "tin_certificate", label: "e-TIN Certificate Document" },
  { key: "cancelled_bank_cheque", label: "Cancelled Bank Cheque Document" },
  // Business & Identity Information
  { key: "trade_license_number", label: "Trade License Number" },
  { key: "nid_number", label: "National ID (NID) Number" },
  { key: "tin", label: "e-TIN Certificate / Number" },
  { key: "bin", label: "BIN / VAT Registration Number" },
  { key: "bank_account_number", label: "Bank Account Number" },
  { key: "bank_account_name", label: "Bank Account Title / Name" },
  { key: "routing_number", label: "Bank Branch Routing Number" },
  { key: "branch_name", label: "Account Branch Name" },
  { key: "legal_business_name", label: "Legal Entity Name" },
  { key: "authorized_person_name", label: "Authorized Signatory Name" },
];

export default function InstitutionKycReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);

  // Correction Modal state
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedFieldKey, setSelectedFieldKey] = useState("trade_license_number");
  const [issueType, setIssueType] = useState("incorrect_value");
  const [issueReason, setIssueReason] = useState("");
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // Review Modal state (Approve / Reject)
  const [reviewAction, setReviewAction] = useState(null); // 'approved' | 'rejected' | 'under_review'
  const [reviewComment, setReviewComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState(null);

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

  const fetchApplicationDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await institutionApi.getApplication(id);
      setData(res.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleOpenDocument = (doc) => {
    setPreviewDoc(doc);
  };

  const openCorrectionForField = (fieldKey, suggestedReason = "") => {
    setSelectedFieldKey(fieldKey);
    setIssueType("incorrect_value");
    setIssueReason(suggestedReason);
    setIsCorrectionModalOpen(true);
  };

  const handleCreateCorrection = async (e) => {
    e.preventDefault();
    if (!issueReason.trim()) return;

    setSubmittingCorrection(true);
    try {
      await institutionApi.requestCorrection(id, {
        fieldKey: selectedFieldKey,
        issueType,
        issueReason: issueReason.trim(),
      });

      setActionSuccess(`Correction requested for ${selectedFieldKey}`);
      setIsCorrectionModalOpen(false);
      setIssueReason("");
      fetchApplicationDetails();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to request correction.");
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      await institutionApi.resolveCorrection(issueId, {
        resolutionNote: "Verified and accepted by institution compliance reviewer.",
      });
      setActionSuccess("Issue marked as resolved");
      fetchApplicationDetails();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to resolve issue.");
    }
  };

  const handleSubmitReviewDecision = async () => {
    if (reviewAction === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    setSubmittingReview(true);
    try {
      await institutionApi.reviewApplication(id, {
        status: reviewAction,
        reviewComment: reviewComment.trim() || undefined,
        rejectionReason: rejectionReason.trim() || undefined,
      });

      setActionSuccess(
        reviewAction === "approved"
          ? "Application approved by Bank! Forwarded to Admin for final platform decision."
          : `Application status updated to '${reviewAction}'`
      );
      setReviewAction(null);
      fetchApplicationDetails();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit review decision.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 size={32} className="animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-xs font-semibold">Loading merchant application compliance package...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-red-600">{error || "Application not found"}</p>
        <Link
          to="/institution/applications"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Back to Applications</span>
        </Link>
      </div>
    );
  }

  const {
    application,
    profile,
    contact,
    commercial,
    kyc,
    documents = [],
    fieldIssues = [],
    versions = [],
    services = [],
    history = [],
  } = data;

  const openIssues = fieldIssues.filter((i) => i.status === "open");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/institution/applications")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Applications Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {application.application_number || `APP-${application.id}`}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              application.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : application.status === "rejected"
                ? "bg-red-100 text-red-800"
                : application.status === "additional_information_required"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {application.status === "approved"
              ? "Bank Approved • Awaiting Admin"
              : application.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess("")} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Header with Actions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {profile?.company_name || profile?.companyName || application.business_name || application.trade_name || "Merchant Application"}
            </h1>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {application.merchant_code}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
            <span>Contact: {contact?.email || application.merchant_email}</span>
            <span>•</span>
            <span>Phone: {contact?.phone || application.merchant_phone || "—"}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Service: {application.gateway_name || "BanglaQR Gateway"}</span>
          </div>
        </div>

        {/* Bank Review Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCorrectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
          >
            <AlertTriangle size={14} />
            <span>Request Field Correction</span>
          </button>

          {application.status !== "under_review" && application.status !== "approved" && (
            <button
              type="button"
              onClick={() => {
                setReviewAction("under_review");
                setReviewComment("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
            >
              <Clock size={14} />
              <span>Mark In Review</span>
            </button>
          )}

          {application.status !== "approved" && (
            <button
              type="button"
              onClick={() => {
                if (application.status === "applied") {
                  alert("Please mark the application as 'Under Review' first before confirming approval decision.");
                  return;
                }
                setReviewAction("approved");
                setReviewComment("");
              }}
              disabled={openIssues.length > 0 || application.status === "applied"}
              title={
                application.status === "applied"
                  ? "Application must be placed 'Under Review' first"
                  : openIssues.length > 0
                  ? "Resolve open KYC issues before approving"
                  : ""
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
            >
              <CheckCircle2 size={14} />
              <span>Approve & Forward to Admin</span>
            </button>
          )}

          {application.status !== "rejected" && (
            <button
              type="button"
              onClick={() => {
                setReviewAction("rejected");
                setRejectionReason("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition cursor-pointer"
            >
              <XCircle size={14} />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Open Issues Alert Banner */}
      {openIssues.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-indigo-600 shrink-0" />
            <h3 className="text-xs font-bold">
              {openIssues.length} Unresolved KYC Field Issue(s) Pending Correction
            </h3>
          </div>
          <div className="space-y-2">
            {openIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 font-mono">[{issue.field_key}]</span>
                  <span className="text-indigo-600 font-semibold ml-2 capitalize">
                    {issue.issue_type.replace(/_/g, " ")}:
                  </span>{" "}
                  <span className="text-slate-600">{issue.issue_reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveIssue(issue.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 text-[11px] shrink-0 transition cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared 8-Tab Application Audit & Merchant Detail Interface */}
      <MerchantAuditDetailTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        merchant={{
          ...application,
          accountStatus: application.merchant_status || application.status,
          kycStatus: kyc ? "under_review" : "pending",
          submittedAt: application.applied_at || application.created_at,
        }}
        profile={profile}
        contact={contact}
        commercial={commercial}
        kyc={kyc}
        documents={documents}
        fieldIssues={fieldIssues}
        services={services}
        versions={versions}
        history={history}
        onViewDoc={handleOpenDocument}
        onFlagDocCorrection={(doc) => {
          const docKey = String(doc.document_type || doc.documentType || "").toLowerCase();
          openCorrectionForField(
            docKey,
            `Document ${doc.document_name || doc.documentName || doc.document_type} requires correction or re-upload.`
          );
        }}
        role="institution"
      />

      {/* Field Correction Request Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-bold">Request KYC Field Correction</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCorrection} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Field Requiring Correction
                </label>
                <select
                  value={selectedFieldKey}
                  onChange={(e) => setSelectedFieldKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {COMMON_KYC_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} ({f.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="incorrect_value">Incorrect Value / Number</option>
                  <option value="illegible_scan">Illegible or Blurry Scan</option>
                  <option value="expired_document">Document is Expired</option>
                  <option value="mismatch">Name or Address Mismatch</option>
                  <option value="missing_supporting_info">Missing Seal or Supporting Annexure</option>
                  <option value="other">Other Compliance Deficiency</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Specific Reviewer Note for Merchant
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain exactly what the merchant must correct or re-upload..."
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingCorrection ? "Submitting..." : "Send Correction Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Decision Modal (Approve / Reject / Under Review) */}
      {reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 capitalize">
              Confirm {reviewAction.replace(/_/g, " ")} Decision
            </h3>
            <p className="text-xs text-slate-500">
              {reviewAction === "approved"
                ? "This records the Bank review decision and forwards the application to the Admin queue for final platform approval."
                : reviewAction === "rejected"
                ? "Please document the regulatory or compliance reason for this rejection."
                : "Application will be placed in active review queue."}
            </p>

            {reviewAction === "rejected" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State the compliance policy or deficiency..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none focus:ring-2 focus:ring-red-500 text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Internal Review Comment (Optional)
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Internal audit notes..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReviewDecision}
                disabled={submittingReview}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer ${
                  reviewAction === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : reviewAction === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {submittingReview ? "Saving..." : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Document Preview Modal */}
      {previewDoc && (
        <SecureDocumentViewerModal
          doc={previewDoc}
          viewUrl={institutionApi.getDocumentViewUrl(id, previewDoc.id)}
          blobFetcher={() => institutionApi.getDocumentBlob(id, previewDoc.id)}
          onClose={() => setPreviewDoc(null)}
          onFlagCorrection={(doc) => {
            const docKey = String(doc.document_type || doc.documentType || "").toLowerCase();
            openCorrectionForField(
              docKey,
              `Document ${doc.document_name || doc.document_type} requires correction or re-upload.`
            );
          }}
        />
      )}
    </div>
  );
}
