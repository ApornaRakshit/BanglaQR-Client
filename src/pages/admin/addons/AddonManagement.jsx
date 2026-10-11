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
  Search,
  Check,
  Clock,
  Building2,
  AlertCircle,
  PackageCheck,
  Layers,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function AddonManagement() {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'applications'
  const [addons, setAddons] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalAddons: 0,
    activeAddons: 0,
    inactiveAddons: 0,
    publishedAddons: 0,
    pendingApplications: 0,
    activatedAddons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Operations",
    price: 0,
    pricingType: "monthly",
    billingCycle: "Monthly",
    status: "available",
    requirements: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [addonRes, statsRes, appRes] = await Promise.all([
        adminApi.getAddons({
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        adminApi.getAddonStats().catch(() => null),
        adminApi.getAddonApplications().catch(() => null),
      ]);

      const list = addonRes?.data || addonRes?.addons || (Array.isArray(addonRes) ? addonRes : []);
      setAddons(Array.isArray(list) ? list : []);

      const appList = appRes?.data || appRes?.applications || (Array.isArray(appRes) ? appRes : []);
      setApplications(Array.isArray(appList) ? appList : []);

      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        const active = list.filter((a) => a.status === "available" || a.status === "active").length;
        setStats({
          totalAddons: list.length,
          activeAddons: active,
          inactiveAddons: list.length - active,
          publishedAddons: active,
          pendingApplications: appList.filter((a) => a.status === "applied" || a.status === "under_review").length,
          activatedAddons: appList.filter((a) => a.status === "activated" || a.status === "approved").length,
        });
      }
    } catch (err) {
      console.error("Failed to load add-on services:", err);
      setError(err?.response?.data?.message || "Failed to load add-on services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setEditingAddon(null);
    setFormData({
      name: "",
      code: "",
      category: "Operations",
      price: 0,
      pricingType: "monthly",
      billingCycle: "Monthly",
      status: "available",
      requirements: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name || "",
      code: addon.code || "",
      category: addon.category || "Operations",
      price: addon.price ?? 0,
      pricingType: addon.pricingType || addon.pricing_type || "monthly",
      billingCycle: addon.billingCycle || addon.billing_cycle || "Monthly",
      status: addon.status || "available",
      requirements: addon.requirements || "",
      description: addon.description || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase().replace(/\s+/g, "_"),
        category: formData.category,
        price: Number(formData.price) || 0,
        pricingType: formData.pricingType,
        billingCycle: formData.billingCycle,
        status: formData.status,
        requirements: formData.requirements || null,
        description: formData.description || null,
      };

      if (editingAddon) {
        await adminApi.updateAddon(editingAddon.id, payload);
      } else {
        await adminApi.createAddon(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save add-on.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate or delete "${name}"?`)) return;
    try {
      const res = await adminApi.deleteAddon(id);
      if (res?.message) alert(res.message);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete add-on.");
    }
  };

  const handleReviewApp = async (appId, action) => {
    try {
      await adminApi.reviewAddonApplication(appId, { action });
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update add-on application status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="text-emerald-600" />
            Add-on Services Catalog & Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage merchant value-added extensions: SMS Notifications, Dynamic SoundBox, Smart Multi-branch QR, and ERP Sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            Create Add-on
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Add-ons</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active / Published</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.activeAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inactive Add-ons</p>
          <p className="text-2xl font-black text-slate-400 mt-1">
            {stats.inactiveAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {stats.publishedAddons ?? stats.activeAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Requests</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {stats.pendingApplications}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activated Merchant</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {stats.activatedAddons}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "catalog"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles size={16} />
          Add-on Products Catalog ({addons.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === "applications"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <PackageCheck size={16} />
          Merchant Add-on Requests ({applications.length})
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search add-on name, code, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </form>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {["all", "available", "active", "inactive"].map((st) => (
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

          {/* Grid */}
          {loading ? (
            <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
              Loading add-on catalog from database...
            </div>
          ) : addons.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <Sparkles size={44} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Add-ons Available</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                No add-on products exist matching your filters. Click "Create Add-on" to register a new service.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Create Add-on
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addons.map((addon) => {
                const isActive = addon.status === "active" || addon.status === "available";
                const isMonthly = (addon.pricingType || addon.pricing_type) === "monthly";
                const isOneTime = (addon.pricingType || addon.pricing_type) === "one_time";
                const isFree = (addon.pricingType || addon.pricing_type) === "free";

                return (
                  <div
                    key={addon.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {addon.category || "Operations"}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                            {addon.name}
                          </h3>
                          <span className="text-xs font-mono text-slate-400">{addon.code}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          <span className="capitalize">{addon.status}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-3 line-clamp-3">
                        {addon.description || "Enhanced BanglaQR operations feature."}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-400 capitalize">
                          {isFree ? "Free Inclusion" : isOneTime ? "One-time Setup" : `${addon.billingCycle || addon.billing_cycle || "Monthly"} Billing`}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            ৳{Number(addon.price || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">
                            {isOneTime ? " once" : isFree ? "" : "/mo"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <Link
                        to={`/admin/addons/${addon.id}`}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        View Specifications <ExternalLink size={12} />
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
                          title="Delete / Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Merchant Requests */}
      {activeTab === "applications" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <PackageCheck size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Merchant Add-on Applications</p>
              <p className="text-xs text-slate-400 mt-1">Merchant requests for optional features will show here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5">Merchant</th>
                    <th className="px-5 py-3.5">Requested Add-on</th>
                    <th className="px-5 py-3.5">Pricing</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Requested Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/merchants/${app.merchantId}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 flex items-center gap-1.5"
                        >
                          <Building2 size={14} className="text-slate-400" />
                          {app.companyName}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400">{app.merchantCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{app.addonName}</div>
                        <span className="text-[11px] text-slate-400 font-mono">{app.addonCode}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                        ৳{app.price} <span className="text-xs font-normal text-slate-400">/{app.pricingType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.status === "activated" || app.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                              : app.status === "closed"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200"
                          }`}
                        >
                          {app.status === "activated" || app.status === "approved" ? (
                            <CheckCircle size={11} />
                          ) : (
                            <Clock size={11} />
                          )}
                          <span className="capitalize">{app.status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {app.status !== "activated" && app.status !== "approved" ? (
                            <button
                              onClick={() => handleReviewApp(app.id, "activate")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReviewApp(app.id, "suspend")}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Add-on Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingAddon ? "Edit Add-on Product" : "Create New Add-on Product"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Add-on Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BanglaQR Voice SoundBox"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Add-on Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOUNDBOX_TERMINAL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Hardware">Hardware Terminal</option>
                  <option value="Operations">Operations & Reporting</option>
                  <option value="Messaging">Messaging & Alerts</option>
                  <option value="Integration">Integration & ERP</option>
                  <option value="Security">Security & Risk</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="available">Available / Published</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Price (৳ BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Pricing Type
                </label>
                <select
                  value={formData.pricingType}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="one_time">One-time</option>
                  <option value="free">Free</option>
                  <option value="per_transaction">Per Tx</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="One-time">One-time</option>
                  <option value="Per-usage">Per Usage</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Prerequisites & Requirements
              </label>
              <input
                type="text"
                placeholder="e.g. Active BanglaQR Merchant Terminal & Verified KYC"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Description & Benefits
              </label>
              <textarea
                rows={3}
                placeholder="Describe value proposition and deployment details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
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
