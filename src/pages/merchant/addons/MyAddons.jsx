import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  CreditCard,
  Plus,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function MyAddons() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getAddons();
      const all = res.data || [];
      // Filter for addons that this merchant has applied for or activated
      const my = all.filter((a) => a.hasApplied || a.has_applied || a.isActivated || a.is_activated);
      setAddons(my);
    } catch (err) {
      console.error("Failed to load my addons:", err);
      setError(err.response?.data?.message || "Failed to load active add-ons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Subscribed Add-ons
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Active extensions, hardware terminals, and reporting plugins enabled for your merchant account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAddons}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/merchant/addons"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Explore Add-on Catalog
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your active add-on subscriptions...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchAddons}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : addons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No active add-on subscriptions</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Enhance your payment collection with SoundBox hardware, instant SMS alerts, multi-branch QR stands, and ERP sync.
          </p>
          <Link
            to="/merchant/addons"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            Browse Available Add-ons
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addons.map((addon) => {
            const isActivated = addon.isActivated || addon.is_activated;
            const status = addon.merchantStatus || addon.merchant_status || "applied";

            return (
              <div
                key={addon.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                      {addon.category || "Operations"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isActivated
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isActivated ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span className="capitalize">{status}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3">{addon.name}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{addon.code}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{addon.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Subscription:</span>
                    <p className="text-sm font-black text-slate-900">
                      ৳{Number(addon.price || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/{addon.pricingType || "mo"}</span>
                    </p>
                  </div>
                  <Link
                    to="/merchant/addons"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    View Details <ArrowRight size={12} />
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

