import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  RotateCw,
  Check,
  X,
  AlertCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function Documents({ defaultStatus = "" }) {
  const [data, setData] = useState({ documents: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(defaultStatus || "all");
  const [documentType, setDocumentType] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Viewer modal
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDocuments({
        search,
        status: status === "all" ? "" : status,
        documentType: documentType === "all" ? "" : documentType,
        page,
        limit: 15,
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to load document vault.");
    } finally {
      setLoading(false);
    }
  }, [search, status, documentType, page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDocumentAction = async (merchantId, documentId, newStatus, reviewComment = "") => {
    try {
      await adminApi.reviewDocument(merchantId, documentId, { status: newStatus, reviewComment });
      fetchDocs();
    } catch (err) {
      alert("Failed to update status: " + (err?.response?.data?.message || err.message));
    }
  };

  const statusBadges = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
    "Additional Document Required": "bg-purple-50 text-purple-700 border-purple-200",
    Uploaded: "bg-amber-50 text-amber-700 border-amber-200",
    Pending: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            Compliance Document Vault & Review
          </h1>
          <p className="mt-1 text-sm sm:text-sm text-slate-500">
            Audit uploaded National IDs, TIN certificates, trade licenses, and bank cheques.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDocs}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
        >
          <RotateCw size={14} className={`text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchDocs();
          }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12"
        >
          <div className="lg:col-span-6 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search file name, merchant code, business name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            >
              <option value="all">All Statuses</option>
              <option value="Uploaded">Uploaded (Pending Review)</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Additional Document Required">Additional Req.</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex gap-2">
            <select
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
            >
              <option value="all">All Document Types</option>
              <option value="NID_FRONT">NID Front</option>
              <option value="NID_BACK">NID Back</option>
              <option value="TIN_CERTIFICATE">TIN Certificate</option>
              <option value="CANCELLED_BANK_CHEQUE">Bank Cheque</option>
              <option value="BIN_CERTIFICATE">BIN Certificate</option>
              <option value="TRADE_LICENSE">Trade License</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <RotateCw size={24} className="animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-semibold">Loading document repository...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-red-600">
            <AlertCircle size={28} className="mb-2" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : data.documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileCheck size={28} className="text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-900">No documents found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Document Type</th>
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Merchant Code / Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploaded Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.documents.map((doc) => (
                  <tr key={doc.id} className="transition hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {doc.documentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        <span className="truncate max-w-[200px]">{doc.documentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{doc.companyName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{doc.merchantCode}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          statusBadges[doc.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                        {doc.status !== "Approved" && (
                          <button
                            type="button"
                            onClick={() => handleDocumentAction(doc.merchantId, doc.id, "Approved", "Approved by reviewer")}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        {doc.status !== "Rejected" && (
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt("Rejection note:", "File is unreadable or mismatched");
                              if (note) handleDocumentAction(doc.merchantId, doc.id, "Rejected", note);
                            }}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-sm font-bold text-red-700 hover:bg-red-100 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 text-sm text-slate-600">
            <span>Page {page} of {data.totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 bg-slate-900 text-white">
              <div>
                <h4 className="font-bold text-sm text-white">{viewingDoc.documentName}</h4>
                <p className="text-[10px] text-slate-400">{viewingDoc.documentType} • {viewingDoc.companyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-900/50 flex items-center justify-center p-4 overflow-auto">
              {viewingDoc.mimeType?.includes("pdf") ? (
                <iframe
                  src={adminApi.getDocumentViewUrl(viewingDoc.merchantId, viewingDoc.id)}
                  title={viewingDoc.documentName}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <img
                  src={adminApi.getDocumentViewUrl(viewingDoc.merchantId, viewingDoc.id)}
                  alt={viewingDoc.documentName}
                  className="max-h-full max-w-full object-contain rounded-xl border border-slate-800"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

