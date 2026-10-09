import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function DocumentReview() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewAction, setReviewAction] = useState(null); // { doc, type: 'approve'|'reject' }
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getDocuments({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setDocuments(res?.data?.documents || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load documents queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewAction) return;
    setActionLoading(true);
    try {
      await adminApi.reviewDocument(
        reviewAction.doc.merchant_id,
        reviewAction.doc.id,
        {
          status: reviewAction.type === "approve" ? "verified" : "rejected",
          rejection_reason: reviewAction.type === "reject" ? rejectionReason : undefined,
        }
      );
      setReviewAction(null);
      setRejectionReason("");
      fetchDocs();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit document review.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="text-emerald-600" />
            Document Verification Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review uploaded merchant business licenses, identity files, and TIN certificates.
          </p>
        </div>
        <button
          onClick={fetchDocs}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "pending", "verified", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No documents found</p>
            <p className="text-sm text-slate-400 mt-1">There are no records matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Document Type</th>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">File Name</th>
                  <th className="px-5 py-3">Uploaded Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {doc.document_type || doc.doc_type || "General Document"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/merchants/${doc.merchant_id}`}
                        className="font-medium text-emerald-600 hover:underline flex items-center gap-1.5"
                      >
                        <Building2 size={14} />
                        {doc.company_name || `Merchant #${doc.merchant_id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-mono">
                      {doc.original_name || doc.file_name || "document.pdf"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
                          doc.status === "verified" || doc.verification_status === "verified"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : doc.status === "rejected" || doc.verification_status === "rejected"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {doc.status === "verified" ? (
                          <CheckCircle size={12} />
                        ) : doc.status === "rejected" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {doc.status || doc.verification_status || "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setReviewAction({ doc, type: "approve" })}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                          title="Approve Document"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => setReviewAction({ doc, type: "reject" })}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Reject Document"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {selectedDoc.document_type || "Document Preview"}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedDoc.original_name || selectedDoc.file_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
              <iframe
                src={adminApi.getDocumentViewUrl(selectedDoc.merchant_id, selectedDoc.id)}
                className="w-full h-full rounded-lg border-0"
                title="Document Preview"
              />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReviewAction({ doc: selectedDoc, type: "approve" });
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
              >
                Approve Document
              </button>
              <button
                onClick={() => {
                  setReviewAction({ doc: selectedDoc, type: "reject" });
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  reviewAction.type === "approve"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60"
                    : "bg-red-100 text-red-600 dark:bg-red-950/60"
                }`}
              >
                {reviewAction.type === "approve" ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {reviewAction.type === "approve" ? "Verify Document" : "Reject Document"}
                </h3>
                <p className="text-sm text-slate-500">
                  {reviewAction.doc.document_type || "Selected file"}
                </p>
              </div>
            </div>

            {reviewAction.type === "reject" && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this document was rejected (e.g. illegible text, expired validity)..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReviewAction(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 ${
                  reviewAction.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                Confirm {reviewAction.type === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

