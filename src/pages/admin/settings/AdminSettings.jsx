import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Save,
  Sliders,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_fee_percent: "1.50",
    maintenance_mode: "false",
    auto_approve_kyc: "false",
    max_daily_tx_limit: "500000",
    support_email: "support@banglaqr.com",
    contact_phone: "+880 1700-000000",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getSettings();
      if (res?.data?.settings) {
        // Map settings array to key-value
        const map = {};
        res.data.settings.forEach((s) => {
          map[s.setting_key] = s.setting_value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setError("");
    try {
      // Save all keys
      for (const [key, value] of Object.entries(settings)) {
        await adminApi.updateSetting(key, { value });
      }
      setSuccessMsg("Platform settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="text-emerald-600" />
            Global Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system operational parameters, MDR fee defaults, and platform mode.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading configurations...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Operational Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders size={16} className="text-emerald-600" /> Operational & Fee Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Default Platform Fee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settings.platform_fee_percent || ""}
                  onChange={(e) => handleChange("platform_fee_percent", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">Base merchant discount rate for BanglaQR transactions.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Max Daily Transaction Limit (BDT)
                </label>
                <input
                  type="number"
                  required
                  value={settings.max_daily_tx_limit || ""}
                  onChange={(e) => handleChange("max_daily_tx_limit", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">Compliance ceiling per unverified merchant tier.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Official Support Email
                </label>
                <input
                  type="email"
                  required
                  value={settings.support_email || ""}
                  onChange={(e) => handleChange("support_email", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Helpdesk Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={settings.contact_phone || ""}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Platform Controls & Safety */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Shield size={16} className="text-emerald-600" /> Platform Security & Maintenance
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                  <p className="text-sm text-slate-500">Temporarily prevent merchant login and new registrations.</p>
                </div>
                <select
                  value={settings.maintenance_mode || "false"}
                  onChange={(e) => handleChange("maintenance_mode", e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="false">Disabled (Live)</option>
                  <option value="true">Enabled (Under Maintenance)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Strict KYC Policy Mode</p>
                  <p className="text-sm text-slate-500">Require all 4 core documents before allowing merchant approval.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Enforced
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Save All Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

