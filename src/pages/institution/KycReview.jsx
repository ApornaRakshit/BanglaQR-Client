import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
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
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  Check,
  X,
  History,
  Layers,
  Download,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");

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

  // Clean up blob URL on unmount or doc change
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const handleOpenDocument = async (doc) => {
    setPreviewDoc(doc);
    setLoadingPreview(true);
    setPreviewError("");

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      const res = await institutionApi.getDocumentBlob(id, doc.id);
      const mime = res.headers?.["content-type"] || doc.mime_type || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(objectUrl);
    } catch (err) {
      console.error("Document load error:", err);
      setPreviewError(err?.response?.data?.message || "Could not retrieve document from secure storage.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCloseDocumentPreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewDoc(null);
    setPreviewError("");
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

      setActionSuccess(`Application successfully updated to '${reviewAction}'`);
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
        <p className="text-xs">Loading application compliance package...</p>
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

  const { application, kyc, documents = [], fieldIssues = [], versions = [] } = data;
  const openIssues = fieldIssues.filter((i) => i.status === "open");

  return (
    <div className="space-y-6">
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
          <span className="text-[11px] font-mono text-slate-400">
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
            {application.status.replace(/_/g, " ")}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {application.business_name || application.trade_name || "Merchant Application"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>Contact: {application.merchant_email}</span>
            <span>•</span>
            <span>Phone: {application.merchant_phone || "—"}</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Service: {application.gateway_name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCorrectionModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
          >
            <AlertTriangle size={14} />
            <span>Request Field Correction</span>
          </button>

          {application.status !== "under_review" && (
            <button
              type="button"
              onClick={() => {
                setReviewAction("under_review");
                setReviewComment("");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
            >
              <Clock size={14} />
              <span>Mark In Review</span>
            </button>
          )}

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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <CheckCircle2 size={14} />
            <span>Approve & Forward to Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReviewAction("rejected");
              setRejectionReason("");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition"
          >
            <XCircle size={14} />
            <span>Reject</span>
          </button>
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
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 text-[11px] shrink-0"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: KYC Information (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Business Identity & Legal Entity */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Business Identity & Registration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Legal Entity Name</span>
                <span className="font-bold text-slate-800 text-sm">
                  {kyc?.legal_business_name || application.business_name || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Business Entity Type</span>
                <span className="font-medium text-slate-700 capitalize">
                  {kyc?.business_entity_type || "Sole Proprietorship"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Trade License #</span>
                <span className="font-mono font-bold text-slate-900">
                  {kyc?.trade_license_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Company Registration #</span>
                <span className="font-mono text-slate-700">
                  {kyc?.registration_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">e-TIN Number</span>
                <span className="font-mono text-slate-700">{kyc?.tin || "—"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">BIN / VAT Number</span>
                <span className="font-mono text-slate-700">{kyc?.bin || "—"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Authorized Signatory */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Authorized Signatory & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Full Name</span>
                <span className="font-bold text-slate-800">{kyc?.authorized_person_name || "—"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Designation</span>
                <span className="font-medium text-slate-700">{kyc?.designation || "Owner / Managing Director"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">NID Card Number</span>
                <span className="font-mono font-bold text-slate-900">{kyc?.nid_number || "—"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">NID Validity</span>
                <span className="text-slate-600">
                  {kyc?.nid_issue_date ? `Issued: ${kyc.nid_issue_date}` : ""}
                  {kyc?.nid_expiry_date ? ` | Expires: ${kyc.nid_expiry_date}` : " | No Expiry (Smart NID)"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Banking & Settlement Account */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Bank Account & Settlement Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Bank Account Title</span>
                <span className="font-bold text-slate-800">{kyc?.bank_account_name || "—"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Account Number</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {kyc?.bank_account_number || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Branch Name</span>
                <span className="font-medium text-slate-700">{kyc?.branch_name || application.branch_name || "—"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">9-Digit Routing Number</span>
                <span className="font-mono font-bold text-slate-900">
                  {kyc?.routing_number || application.routing_number || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Documents & Versions (1 Col) */}
        <div className="space-y-6">
          {/* Documents Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Compliance Documents ({documents.length})</span>
              <FileText size={16} className="text-emerald-600" />
            </h3>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const docKey = String(doc.document_type || "").toLowerCase();
                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/75 hover:bg-slate-100/80 transition flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate capitalize">
                          {doc.custom_label || doc.document_name || doc.document_type.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {doc.original_filename || "Document file"} •{" "}
                          {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : "File"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            openCorrectionForField(
                              docKey,
                              `Document ${doc.document_name || doc.document_type} requires correction or re-upload.`
                            )
                          }
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-2xs transition"
                          title="Request correction for this document"
                        >
                          <AlertTriangle size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDocument(doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 shadow-2xs font-semibold text-xs transition"
                          title="Securely preview document"
                        >
                          <Eye size={13} className="text-emerald-600" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submission History / Versions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History size={16} className="text-slate-400" />
              <span>Submission Versions</span>
            </h3>

            {versions.length === 0 ? (
              <p className="text-xs text-slate-400">Version 1 (Initial Submission)</p>
            ) : (
              <div className="space-y-2">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Version #{ver.version_no}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    {ver.change_summary && (
                      <p className="text-[11px] text-slate-600 mt-1">{ver.change_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50"
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
                ? "This will officially connect the merchant to the requested institutional service."
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none focus:ring-2 focus:ring-red-500"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReviewDecision}
                disabled={submittingReview}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                    {previewDoc.custom_label || previewDoc.document_name || previewDoc.document_type}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {previewDoc.original_filename || "Document"} • {previewDoc.mime_type || "image/png"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewBlobUrl && (
                  <a
                    href={previewBlobUrl}
                    download={previewDoc.original_filename || `${previewDoc.document_type || "doc"}.bin`}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-600 transition"
                    title="Download file"
                  >
                    <Download size={16} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCloseDocumentPreview}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-950/5 min-h-[300px]">
              {loadingPreview ? (
                <div className="text-center py-12 text-slate-500">
                  <Loader2 size={32} className="animate-spin mx-auto text-emerald-600 mb-2" />
                  <p className="text-xs">Fetching document securely from storage...</p>
                </div>
              ) : previewError ? (
                <div className="p-6 text-center max-w-sm">
                  <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
                  <p className="text-xs font-bold text-red-600">{previewError}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    The requested file is either missing from server storage or requires refreshed permissions.
                  </p>
                </div>
              ) : previewBlobUrl ? (
                previewDoc.mime_type?.includes("pdf") ? (
                  <iframe
                    src={previewBlobUrl}
                    className="w-full h-[65vh] rounded-lg border border-slate-200"
                    title={previewDoc.document_name || "PDF Document"}
                  />
                ) : (
                  <img
                    src={previewBlobUrl}
                    alt={previewDoc.document_name || "Document Preview"}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md"
                  />
                )
              ) : null}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                End-to-end encrypted compliance storage. Authorized reviewer audit applied.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const docKey = String(previewDoc.document_type || "").toLowerCase();
                    handleCloseDocumentPreview();
                    openCorrectionForField(
                      docKey,
                      `Document ${previewDoc.document_name || previewDoc.document_type} requires correction or re-upload.`
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition"
                >
                  Flag for Correction
                </button>
                <button
                  type="button"
                  onClick={handleCloseDocumentPreview}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

