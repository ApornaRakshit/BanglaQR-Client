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
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchApps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getGatewayApplications({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setApplications(res?.data?.applications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load gateway applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="text-emerald-600" />
            Gateway Applications
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
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "pending", "approved", "rejected"].map((st) => (
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
          <div className="p-12 text-center text-slate-400">Loading gateway applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Layers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No Applications Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no gateway onboarding requests matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Requested Gateway</th>
                  <th className="px-5 py-3">Applied Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/merchants/${app.merchant_id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 flex items-center gap-1.5"
                      >
                        <Building2 size={15} />
                        {app.company_name || `Merchant #${app.merchant_id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {app.gateway_name || app.gateway_code || "Payment Rail"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                          app.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : app.status === "rejected"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {app.status === "approved" ? (
                          <CheckCircle size={12} />
                        ) : app.status === "rejected" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/merchants/${app.merchant_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        Inspect Merchant <ExternalLink size={12} />
                      </Link>
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

