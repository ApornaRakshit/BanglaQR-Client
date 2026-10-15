import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Package,
  CreditCard,
  Settings,
  AlertCircle,
  RefreshCw,
  QrCode,
  Smartphone,
  Code2
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function MyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getMyServices();
      setServices(res.data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err.response?.data?.message || "Failed to load active services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Payment Services
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your approved and activated payment gateway integrations and credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh services"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/merchant/gateways"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-150"
          >
            <CreditCard className="h-4 w-4" />
            Explore Gateways
          </Link>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your payment services...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No active services yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Once your gateway applications are approved, your activated payment services and configuration options will appear here.
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <Link
              to="/merchant/gateways"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              Browse Gateway Catalogue
            </Link>
            <Link
              to="/merchant/applications"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              View Application Status
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc) => {
            const isActive = svc.status === "active";
            const isSuspended = svc.status === "suspended";

            return (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all p-6 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200/70 p-2 flex items-center justify-center shrink-0">
                        {svc.gateway_logo ? (
                          <img
                            src={svc.gateway_logo}
                            alt={svc.gateway_name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <CreditCard className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {svc.gateway_name || "Payment Service"}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {svc.gateway_code || `SVC-${svc.id}`}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isSuspended
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive
                            ? "bg-emerald-500"
                            : isSuspended
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span className="capitalize">{svc.status || "Active"}</span>
                    </span>
                  </div>

                  {/* Capabilities / Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <QrCode className="h-3 w-3 text-emerald-600" />
                      BanglaQR Interoperable
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <Smartphone className="h-3 w-3 text-emerald-600" />
                      MFS & Cards
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <Code2 className="h-3 w-3 text-emerald-600" />
                      Direct API
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 text-xs text-slate-500 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span>Activated On:</span>
                      <span className="font-semibold text-slate-700">
                        {svc.activated_at
                          ? new Date(svc.activated_at).toLocaleDateString()
                          : "Active"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment Mode:</span>
                      <span className="font-semibold text-slate-700 uppercase">
                        {svc.configuration?.mode || "Sandbox / Live"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link
                    to={`/merchant/services/${svc.id}/configure`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configure Service
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

