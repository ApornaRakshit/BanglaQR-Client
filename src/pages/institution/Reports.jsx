import { useState, useEffect } from "react";
import {
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Calendar,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

export default function InstitutionReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await institutionApi.getReports();
      setReportData(res.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load operational reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportSummary = () => {
    if (!reportData) return;
    const jsonStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `institution_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = reportData?.summary || {};
  const recentLogs = reportData?.recentActivity || [];
  const servicesSummary = reportData?.servicesSummary || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <BarChart3 size={24} />
            </div>
            Institution Compliance & Operational Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated merchant application volumes, approval metrics, and operational audit trail
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReports}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>

          <button
            type="button"
            onClick={handleExportSummary}
            disabled={!reportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total Pipeline</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary.applications?.total || 0}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Approved: {summary.applications?.approved || 0}</span>
            <span>Rejected: {summary.applications?.rejected || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Approval Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {summary.applications?.total
              ? `${Math.round(((summary.applications?.approved || 0) / summary.applications.total) * 100)}%`
              : "0%"}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Pending Review: {summary.applications?.pending || 0}</span>
            <span>Corrections: {summary.applications?.correctionRequired || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Branch Network</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary.branches?.total || 0}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Active: {summary.branches?.active || 0}</span>
            <span>Sub-branches: {summary.branches?.subBranches || 0}</span>
          </div>
        </div>
      </div>

      {/* Services Breakdown */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Active Services Status Breakdown</span>
          <Layers size={16} className="text-slate-400" />
        </h3>

        {servicesSummary.length === 0 ? (
          <p className="text-xs text-slate-400">No services configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {servicesSummary.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/75 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{s.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{s.code}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.connectionStatus === "connected"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {s.connectionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operational Activity Trail */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden space-y-2 p-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Activity size={16} className="text-emerald-600" />
          <span>Operational Audit Trail (Institution-Scoped)</span>
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No operational events logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Status Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {log.user_email || "System"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ""}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.status_transition ? (
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {log.status_transition}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

