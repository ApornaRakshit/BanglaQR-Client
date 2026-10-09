import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Code,
  RefreshCw,
  Eye,
  Shield,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter !== "all" ? actionFilter : undefined,
        search: search.trim() || undefined,
      });
      setLogs(res?.data?.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-600" />
            Security & Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of all administrative reviews, status transitions, settings modifications, and approvals.
          </p>
        </div>
        <button
          onClick={fetchLogs}
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
            placeholder="Search by action, admin, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="MERCHANT_APPROVED">Merchant Approved</option>
            <option value="MERCHANT_REJECTED">Merchant Rejected</option>
            <option value="KYC_VERIFIED">KYC Verified</option>
            <option value="DOCUMENT_REVIEWED">Document Reviewed</option>
            <option value="SETTING_UPDATED">Settings Updated</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No Audit Logs Found</p>
            <p className="text-sm text-slate-400 mt-1">Platform actions will be logged here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Target Entity</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap font-sans text-sm">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.action?.includes("APPROV") || log.action?.includes("VERIF")
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : log.action?.includes("REJECT")
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans font-medium text-slate-900 dark:text-white">
                      {log.user_email || log.admin_email || `User #${log.user_id || log.admin_id || "SYS"}`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id}` : "System"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="text-emerald-600" size={20} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Audit Entry Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400">Action:</span>{" "}
                <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400">Timestamp:</span>{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">User:</span>{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.user_email || `ID #${selectedLog.user_id}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Target:</span>{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.entity_type} #{selectedLog.entity_id}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code size={13} /> Recorded Payload Diff
              </label>
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-sm rounded-xl overflow-x-auto max-h-60 border border-slate-800">
                {JSON.stringify(
                  typeof selectedLog.details === "string"
                    ? JSON.parse(selectedLog.details || "{}")
                    : selectedLog.details || {},
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

