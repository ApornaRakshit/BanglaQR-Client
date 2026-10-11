import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Layers,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  Check,
  X,
  FileText,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewAction, setReviewAction] = useState("approve");
  const [reviewNote, setReviewNote] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchApps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getGatewayApplications({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      const list = res?.data || res?.applications || (Array.isArray(res) ? res : []);
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load gateway applications:", err);
      setError(err?.response?.data?.message || "Failed to load gateway applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApps();
  };

  const openReviewModal = (app, defaultAction = "approve") => {
    setSelectedApp(app);
    setReviewAction(defaultAction);
    setReviewNote(app.reviewNote || app.review_note || "");
    setActionSuccess("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setSubmittingReview(true);
      setError("");
      await adminApi.reviewGatewayApplication(selectedApp.id, {
        action: reviewAction,
        reviewNote: reviewNote.trim() || undefined,
      });

      setActionSuccess(`Application #${selectedApp.id} ${reviewAction}d successfully!`);
      setTimeout(() => {
        setSelectedApp(null);
        setActionSuccess("");
        fetchApps();
      }, 1200);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit review decision.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case "additional_information_required":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200">
            <AlertCircle size={12} /> Action Required
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200">
            <Clock size={12} /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200">
            <Clock size={12} /> Applied (Pending)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="text-emerald-600" />
            Gateway Applications Review
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and provision payment gateway requests submitted by registered merchants.
          </p>
        </div>
        <button
          onClick={fetchApps}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, code, or gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </form>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "additional_information_required", label: "Action Needed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
            Loading gateway applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Layers size={44} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Applications Found</h3>
            <p className="text-sm text-slate-400 mt-1">There are no gateway onboarding requests matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Ref / Merchant</th>
                  <th className="px-5 py-3.5">Requested Gateway</th>
                  <th className="px-5 py-3.5">Merchant Contact</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {applications.map((app) => {
                  const appId = app.id;
                  const ref = app.applicationReference || `BQR-APP-${String(appId).padStart(6, "0")}`;
                  const company = app.companyName || app.company_name || `Merchant #${app.merchantId || app.merchant_id}`;
                  const mCode = app.merchantCode || app.merchant_code || "";
                  const gwName = app.gatewayName || app.gateway_name || app.gatewayCode || "Payment Rail";
                  const gwCode = app.gatewayCode || app.gateway_code || "";
                  const appliedDate = app.appliedAt || app.applied_at || app.createdAt || app.created_at;

                  return (
                    <tr key={appId} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-mono text-xs font-bold text-emerald-600">{ref}</div>
                          <Link
                            to={`/admin/merchants/${app.merchantId || app.merchant_id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-sm flex items-center gap-1 mt-0.5"
                          >
                            <Building2 size={13} className="text-slate-400" />
                            {company}
                          </Link>
                          {mCode && <span className="text-[11px] font-mono text-slate-400">{mCode}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{gwName}</div>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">{gwCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Mail size={12} className="text-slate-400" />
                          {app.email || "—"}
                        </div>
                        {app.phone && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={12} className="text-slate-400" />
                            {app.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        {appliedDate ? new Date(appliedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(app.status)}
                        {(app.reviewNote || app.review_note) && (
                          <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1 max-w-[200px]" title={app.reviewNote || app.review_note}>
                            "{app.reviewNote || app.review_note}"
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openReviewModal(app, app.status === "approved" ? "approve" : "approve")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                          >
                            Review & Decide
                          </button>
                          <Link
                            to={`/admin/merchants/${app.merchantId || app.merchant_id}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                            title="Inspect Merchant Profile"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Compliance & Gateway Review
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedApp.applicationReference || `BQR-APP-${String(selectedApp.id).padStart(6, "0")}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Merchant Summary Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant Business:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedApp.companyName || selectedApp.company_name} ({selectedApp.merchantCode || selectedApp.merchant_code})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Gateway:</span>
                <span className="font-bold text-emerald-600">
                  {selectedApp.gatewayName || selectedApp.gateway_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold capitalize text-slate-700 dark:text-slate-300">{selectedApp.status}</span>
              </div>
            </div>

            {/* Decision Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Review Decision *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction("approve")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    reviewAction === "approve"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle size={16} className={reviewAction === "approve" ? "text-emerald-600" : "text-slate-400"} />
                  Approve & Provision
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("request_information")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    reviewAction === "request_information"
                      ? "bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <AlertCircle size={16} className={reviewAction === "request_information" ? "text-purple-600" : "text-slate-400"} />
                  Request Details
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("reject")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    reviewAction === "reject"
                      ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <XCircle size={16} className={reviewAction === "reject" ? "text-rose-600" : "text-slate-400"} />
                  Reject
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Reviewer Note / Feedback to Merchant
              </label>
              <textarea
                rows={3}
                placeholder={
                  reviewAction === "approve"
                    ? "Optional approval remarks or integration guidance..."
                    : "Explain reasons for rejection or specify additional documents required..."
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold text-center">
                {actionSuccess}
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
              >
                {submittingReview && <RefreshCw size={12} className="animate-spin" />}
                Confirm Decision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
