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
  AlertCircle,
  KeyRound,
  Edit2,
  Check,
  PauseCircle,
  PlayCircle,
  QrCode,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Status Change Modal
  const [selectedService, setSelectedService] = useState(null);
  const [targetStatus, setTargetStatus] = useState("active");
  const [updating, setUpdating] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getGatewayServices({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const list = res?.data || res?.services || (Array.isArray(res) ? res : []);
      setServices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load provisioned services:", err);
      setError(err?.response?.data?.message || "Failed to load active gateway services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      setUpdating(true);
      await adminApi.updateGatewayServiceStatus(selectedService.id, {
        status: targetStatus,
      });
      setSelectedService(null);
      fetchServices();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update service status.");
    } finally {
      setUpdating(false);
    }
  };

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
            Active payment routing and terminal credentials configured per merchant account.
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

      {/* Search & Filters */}
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
          {["all", "active", "suspended", "inactive"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
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
            Loading provisioned gateway services...
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={44} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Gateway Services Provisioned</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Services will appear here automatically once merchant gateway applications are approved and provisioned.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Merchant</th>
                  <th className="px-5 py-3.5">Active Gateway</th>
                  <th className="px-5 py-3.5">Terminal / Store ID</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Provisioned On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {services.map((srv) => {
                  const company = srv.companyName || srv.company_name || `Merchant #${srv.merchantId || srv.merchant_id}`;
                  const mCode = srv.merchantCode || srv.merchant_code || "";
                  const gwName = srv.gatewayName || srv.gateway_name || "Payment Gateway";
                  const gwCode = srv.gatewayCode || srv.gateway_code || "";
                  const config = srv.configuration || {};
                  const storeId = config.storeId || config.store_id || config.merchantId || config.merchant_id || `MID_${srv.merchantId || srv.merchant_id}`;
                  const isSandbox = config.sandboxMode !== false && config.mode !== "live";
                  const actDate = srv.activatedAt || srv.activated_at || srv.createdAt || srv.created_at;

                  return (
                    <tr key={srv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                      <td className="px-5 py-4">
                        <div>
                          <Link
                            to={`/admin/merchants/${srv.merchantId || srv.merchant_id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-sm flex items-center gap-1.5"
                          >
                            <Building2 size={14} className="text-slate-400" />
                            {company}
                          </Link>
                          {mCode && <span className="text-[11px] font-mono text-slate-400">{mCode}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{gwName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 uppercase">{gwCode}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                            {isSandbox ? "Sandbox" : "Production"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <KeyRound size={12} className="text-emerald-600" />
                          {storeId}
                        </div>
                        {config.apiKey && (
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            Key: {config.apiKey}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            srv.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200"
                              : srv.status === "suspended"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border-slate-200"
                          }`}
                        >
                          {srv.status === "active" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          <span className="capitalize">{srv.status || "Active"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        {actDate ? new Date(actDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedService(srv);
                              setTargetStatus(srv.status || "active");
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold shadow-sm transition"
                          >
                            Update Status
                          </button>
                          <Link
                            to={`/admin/merchants/${srv.merchantId || srv.merchant_id}`}
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

      {/* Update Status Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleStatusUpdate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Manage Service Status
              </h3>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Merchant:</span>{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedService.companyName || selectedService.company_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Gateway:</span>{" "}
                <span className="font-bold text-emerald-600">
                  {selectedService.gatewayName || selectedService.gateway_name}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Operational Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="active">Active (Permit Payment Routing)</option>
                <option value="suspended">Suspended (Temporarily Block)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
              >
                {updating && <RefreshCw size={12} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
