import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayManagement() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "MFS",
    status: "active",
    fee_percentage: "1.50",
    fee_fixed: "0.00",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchGateways = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getGateways();
      setGateways(res?.data?.gateways || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payment gateways.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const openAddModal = () => {
    setEditingGateway(null);
    setFormData({
      name: "",
      code: "",
      type: "MFS",
      status: "active",
      fee_percentage: "1.50",
      fee_fixed: "0.00",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (gw) => {
    setEditingGateway(gw);
    setFormData({
      name: gw.name || "",
      code: gw.code || "",
      type: gw.type || "MFS",
      status: gw.status || "active",
      fee_percentage: gw.fee_percentage || "1.50",
      fee_fixed: gw.fee_fixed || "0.00",
      description: gw.description || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGateway) {
        await adminApi.updateGateway(editingGateway.id, formData);
      } else {
        await adminApi.createGateway(formData);
      }
      setIsModalOpen(false);
      fetchGateways();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save gateway.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove "${name}"?`)) return;
    try {
      await adminApi.deleteGateway(id);
      fetchGateways();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete gateway.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="text-emerald-600" />
            Payment Gateway Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure BanglaQR, MFS networks (bKash, Nagad, Rocket), and card rails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            Add Gateway
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Gateways</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {gateways.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Gateways</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {gateways.filter((g) => g.status === "active").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">BanglaQR Interoperable</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            {gateways.filter((g) => g.type === "BanglaQR" || g.type === "Interoperable").length || gateways.length}
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Gateways Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
          Loading gateway configurations...
        </div>
      ) : gateways.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <CreditCard size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold">No Gateways Configured</p>
          <p className="text-sm text-slate-400 mt-1">Click "Add Gateway" to set up your first rail.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                      {gw.code?.substring(0, 3).toUpperCase() || "GW"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {gw.name}
                      </h3>
                      <span className="text-sm font-mono text-slate-400">{gw.code}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      gw.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {gw.status === "active" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {gw.status}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                  {gw.description || "Digital payment gateway integrated for BanglaQR merchant settlements."}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{gw.type || "MFS"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rate:</span>{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {gw.fee_percentage}% + {gw.fee_fixed || "0"} BDT
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <Link
                  to={`/admin/gateways/${gw.id}`}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View Details <ExternalLink size={12} />
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(gw)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Edit Gateway"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(gw.id, gw.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                    title="Delete Gateway"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Gateway Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingGateway ? "Edit Gateway" : "Add Payment Gateway"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Gateway Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash BanglaQR"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Gateway Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BKASH_DIRECT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Rail Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="BanglaQR">BanglaQR Interoperable</option>
                  <option value="MFS">MFS Direct</option>
                  <option value="Card">Card Network (Visa/MC)</option>
                  <option value="InternetBanking">Internet Banking</option>
                </select>
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
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.fee_percentage}
                  onChange={(e) => setFormData({ ...formData, fee_percentage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Fixed Fee (BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fee_fixed}
                  onChange={(e) => setFormData({ ...formData, fee_fixed: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Description
              </label>
              <textarea
                rows={2}
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
                {editingGateway ? "Update Gateway" : "Create Gateway"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

