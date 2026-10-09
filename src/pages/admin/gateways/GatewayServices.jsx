import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Briefcase,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getGatewayServices({
        search: search.trim() || undefined,
      });
      setServices(res?.data?.services || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load active gateway services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="text-emerald-600" />
            Provisioned Gateway Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active payment routing and credentials configured per merchant account.
          </p>
        </div>
        <button
          onClick={fetchServices}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant company or gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
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
          <div className="p-12 text-center text-slate-400">Loading active gateway services...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No Gateway Services Provisioned</p>
            <p className="text-sm text-slate-400 mt-1">Services will appear once merchant onboarding applications are approved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Active Gateway</th>
                  <th className="px-5 py-3">MID / Terminal ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Provisioned Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/merchants/${srv.merchant_id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 flex items-center gap-1.5"
                      >
                        <Building2 size={15} />
                        {srv.company_name || `Merchant #${srv.merchant_id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {srv.gateway_name || srv.gateway_code}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                      {srv.merchant_identifier || srv.terminal_id || "BQR-LIVE-001"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                          srv.status === "active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {srv.status === "active" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {srv.status || "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {srv.created_at ? new Date(srv.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/merchants/${srv.merchant_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        Manage Routing <ExternalLink size={12} />
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

