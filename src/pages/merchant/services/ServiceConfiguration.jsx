import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Settings,
  CreditCard,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  Globe,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function ServiceConfiguration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    mode: "sandbox",
    store_id: "",
    merchant_id: "",
    secret_key: "",
    webhook_url: "",
    success_url: "",
    fail_url: "",
    ip_whitelist: "",
  });

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getMyServiceById(id);
      const svc = res.data;
      setService(svc);

      // Populate config if present
      const config = svc.configuration || {};
      setFormData({
        mode: config.mode || "sandbox",
        store_id: config.store_id || "",
        merchant_id: config.merchant_id || "",
        secret_key: config.secret_key || "",
        webhook_url: config.webhook_url || "",
        success_url: config.success_url || "",
        fail_url: config.fail_url || "",
        ip_whitelist: config.ip_whitelist || "",
      });
    } catch (err) {
      console.error("Failed to load service:", err);
      setError(err.response?.data?.message || "Failed to load service configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      await merchantApi.updateServiceConfiguration(id, {
        configuration: formData,
      });

      setSuccessMsg("Configuration saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to save configuration:", err);
      setError(err.response?.data?.message || "Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading service configuration...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <p className="font-semibold">{error || "Service not found"}</p>
        <Link
          to="/merchant/services"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          to="/merchant/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Services
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
            {service.gateway_logo ? (
              <img
                src={service.gateway_logo}
                alt={service.gateway_name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <CreditCard className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                {service.gateway_name || "Payment Service"} Configuration
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                {service.gateway_code || `SVC-${service.id}`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure credentials, endpoints, webhooks, and operational environment mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Environment:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: "sandbox" })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                formData.mode === "sandbox"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sandbox
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: "live" })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                formData.mode === "live"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Live
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            Gateway Credentials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your merchant ID and secrets provided by the payment gateway provider.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Store ID / Merchant ID
            </label>
            <input
              type="text"
              placeholder="e.g. banglaqr_store_123"
              value={formData.store_id}
              onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secret Key / Store Password
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                placeholder="Enter private secret key"
                value={formData.secret_key}
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                {formData.secret_key && (
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.secret_key)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                    title="Copy key"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 pt-4 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            Webhook & IPN Endpoints
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure where automated payment status callbacks and notifications should be delivered.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Webhook URL (Instant Payment Notification)
            </label>
            <input
              type="url"
              placeholder="https://yourdomain.com/api/webhook/banglaqr"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Success Callback URL
              </label>
              <input
                type="url"
                placeholder="https://yourdomain.com/checkout/success"
                value={formData.success_url}
                onChange={(e) => setFormData({ ...formData, success_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Failure Callback URL
              </label>
              <input
                type="url"
                placeholder="https://yourdomain.com/checkout/failed"
                value={formData.fail_url}
                onChange={(e) => setFormData({ ...formData, fail_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              IP Whitelist (Optional, comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. 103.204.1.20, 103.204.1.21"
              value={formData.ip_whitelist}
              onChange={(e) => setFormData({ ...formData, ip_whitelist: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/merchant/services"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

