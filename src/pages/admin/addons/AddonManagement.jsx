import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function AddonManagement() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "0.00",
    billing_type: "monthly",
    status: "active",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchAddons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getAddons();
      setAddons(res?.data?.addons || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load add-on services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const openAddModal = () => {
    setEditingAddon(null);
    setFormData({
      name: "",
      code: "",
      price: "0.00",
      billing_type: "monthly",
      status: "active",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name || "",
      code: addon.code || "",
      price: addon.price || "0.00",
      billing_type: addon.billing_type || "monthly",
      status: addon.status || "active",
      description: addon.description || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAddon) {
        await adminApi.updateAddon(editingAddon.id, formData);
      } else {
        await adminApi.createAddon(formData);
      }
      setIsModalOpen(false);
      fetchAddons();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save add-on.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete "${name}"?`)) return;
    try {
      await adminApi.deleteAddon(id);
      fetchAddons();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete add-on.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="text-emerald-600" />
            Add-on Services Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage premium merchant plugins: SMS Alerts, SoundBox Terminal, Multi-branch QR, and ERP Integration.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          Create Add-on
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
          Loading add-on catalog...
        </div>
      ) : addons.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <Sparkles size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">No Add-ons Available</p>
          <p className="text-sm text-slate-400 mt-1">Create your first add-on product above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-500/50 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {addon.name}
                    </h3>
                    <span className="text-sm font-mono text-slate-400">{addon.code}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      addon.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {addon.status === "active" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {addon.status}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-3 line-clamp-3">
                  {addon.description || "Enhanced BanglaQR operations feature."}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                  <span className="text-sm text-slate-400 capitalize">
                    {addon.billing_type || "monthly"} subscription
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ৳{Number(addon.price || 0).toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400">/{addon.billing_type === "one_time" ? "once" : "mo"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <Link
                  to={`/admin/addons/${addon.id}`}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View Subscriptions <ExternalLink size={12} />
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(addon)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Edit Addon"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id, addon.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                    title="Delete Addon"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingAddon ? "Edit Add-on Service" : "Create New Add-on"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Add-on Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Instant Audio SoundBox Terminal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Service Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOUNDBOX_DEVICE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Billing Cycle
                </label>
                <select
                  value={formData.billing_type}
                  onChange={(e) => setFormData({ ...formData, billing_type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="monthly">Monthly Recurring</option>
                  <option value="yearly">Yearly Recurring</option>
                  <option value="one_time">One-time Purchase</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Price (BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                {saving && <RefreshCw size={12} className="animate-spin" />}
                {editingAddon ? "Update Add-on" : "Create Add-on"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

