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
  QrCode,
  Smartphone,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function GatewayManagement() {
  const [gateways, setGateways] = useState([]);
  const [stats, setStats] = useState({
    totalGateways: 0,
    activeGateways: 0,
    inactiveGateways: 0,
    draftGateways: 0,
    gatewayApplications: 0,
    provisionedServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    serviceType: "Payment Gateway",
    status: "active",
    serviceFee: 1.5,
    setupFee: 0,
    logoUrl: "",
    description: "",
    qrSupported: true,
    cardSupported: false,
    mobileSupported: true,
    apiSupported: true,
    supportedMethodsText: "BanglaQR, bKash App, USSD",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [gwRes, statsRes] = await Promise.all([
        adminApi.getGateways({
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        adminApi.getGatewayStats().catch(() => null),
      ]);

      const list = gwRes?.data || gwRes?.gateways || (Array.isArray(gwRes) ? gwRes : []);
      setGateways(Array.isArray(list) ? list : []);

      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        // Compute fallback from loaded list
        const active = list.filter((g) => g.status === "active").length;
        setStats({
          totalGateways: list.length,
          activeGateways: active,
          inactiveGateways: list.length - active,
          draftGateways: list.filter((g) => g.status === "draft").length,
          gatewayApplications: stats.gatewayApplications || 0,
          provisionedServices: stats.provisionedServices || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load gateways:", err);
      setError(err?.response?.data?.message || "Failed to load payment gateways.");
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
    setEditingGateway(null);
    setFormData({
      name: "",
      code: "",
      serviceType: "MFS Gateway",
      status: "active",
      serviceFee: 1.5,
      setupFee: 0,
      logoUrl: "",
      description: "",
      qrSupported: true,
      cardSupported: false,
      mobileSupported: true,
      apiSupported: true,
      supportedMethodsText: "BanglaQR, App, USSD",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (gw) => {
    setEditingGateway(gw);
    const methods = Array.isArray(gw.supportedMethods)
      ? gw.supportedMethods.join(", ")
      : gw.supported_methods || "";

    setFormData({
      name: gw.name || "",
      code: gw.code || "",
      serviceType: gw.serviceType || gw.service_type || "MFS Gateway",
      status: gw.status || "active",
      serviceFee: gw.serviceFee ?? gw.service_fee ?? 1.5,
      setupFee: gw.setupFee ?? gw.setup_fee ?? 0,
      logoUrl: gw.logoUrl || gw.logo_url || "",
      description: gw.description || "",
      qrSupported: gw.qrSupported ?? Boolean(gw.qr_supported),
      cardSupported: gw.cardSupported ?? Boolean(gw.card_supported),
      mobileSupported: gw.mobileSupported ?? Boolean(gw.mobile_supported),
      apiSupported: gw.apiSupported ?? Boolean(gw.api_supported),
      supportedMethodsText: methods,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const methodsArray = formData.supportedMethodsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase().replace(/\s+/g, "_"),
        serviceType: formData.serviceType,
        status: formData.status,
        serviceFee: Number(formData.serviceFee) || 0,
        setupFee: Number(formData.setupFee) || 0,
        logoUrl: formData.logoUrl || null,
        description: formData.description || null,
        qrSupported: Boolean(formData.qrSupported),
        cardSupported: Boolean(formData.cardSupported),
        mobileSupported: Boolean(formData.mobileSupported),
        apiSupported: Boolean(formData.apiSupported),
        supportedMethods: methodsArray,
      };

      if (editingGateway) {
        await adminApi.updateGateway(editingGateway.id, payload);
      } else {
        await adminApi.createGateway(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save payment gateway.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${name}"?`)) return;
    try {
      const res = await adminApi.deleteGateway(id);
      if (res?.message) alert(res.message);
      fetchData();
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
            Authoritative source of truth for BanglaQR interoperability, MFS rails, and Card acquirers.
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
            Add Gateway
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Gateways</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalGateways}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Gateways</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.activeGateways}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inactive / Draft</p>
          <p className="text-2xl font-black text-slate-500 mt-1">
            {stats.inactiveGateways + (stats.draftGateways || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {stats.publishedGateways ?? stats.activeGateways}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Applications</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {stats.gatewayApplications}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Provisioned</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {stats.provisionedServices}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search gateway name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </form>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "active", "inactive", "draft"].map((st) => (
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
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Gateways Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
          Loading payment gateway records from database...
        </div>
      ) : gateways.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <CreditCard size={44} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Gateways Configured</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "No gateways matched your search or status filter. Try clearing filters."
              : "No payment gateways exist in the database. Click 'Add Gateway' to register your first payment channel."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            Add First Gateway
          </button>
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
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 p-2 shrink-0">
                      {gw.logoUrl || gw.logo_url ? (
                        <img
                          src={gw.logoUrl || gw.logo_url}
                          alt={gw.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-xs font-bold text-emerald-600">
                          {gw.code?.substring(0, 3).toUpperCase() || "GW"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {gw.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-400">{gw.code}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      gw.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                        : gw.status === "draft"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {gw.status === "active" ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    <span className="capitalize">{gw.status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                  {gw.description || "Digital payment gateway integrated for BanglaQR merchant settlements."}
                </p>

                {/* Capabilities Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(gw.qrSupported ?? gw.qr_supported) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      <QrCode size={11} className="text-emerald-600" /> BanglaQR
                    </span>
                  )}
                  {(gw.mobileSupported ?? gw.mobile_supported) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      <Smartphone size={11} className="text-emerald-600" /> MFS
                    </span>
                  )}
                  {(gw.cardSupported ?? gw.card_supported) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      <CreditCard size={11} className="text-emerald-600" /> Cards
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Service Fee:</span>{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {gw.serviceFee ?? gw.service_fee ?? 1.5}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Setup Fee:</span>{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      ৳{gw.setupFee ?? gw.setup_fee ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <Link
                  to={`/admin/gateways/${gw.id}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
                    title="Delete / Deactivate"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingGateway ? "Edit Payment Gateway" : "Add New Payment Gateway"}
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
                  Gateway Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash BanglaQR & Direct"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Gateway Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BKASH_DIRECT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="MFS Gateway">MFS Gateway</option>
                  <option value="Bank MFS">Bank MFS</option>
                  <option value="Card Gateway">Card Gateway</option>
                  <option value="Interoperable QR">Interoperable QR</option>
                  <option value="Payment Gateway">Payment Gateway</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="active">Active & Published</option>
                  <option value="inactive">Inactive / Unpublished</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Service Fee (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={formData.serviceFee}
                  onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Setup Fee (BDT)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.setupFee}
                  onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Supported Methods (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. BanglaQR, bKash App, USSD, Tokenized Checkout"
                value={formData.supportedMethodsText}
                onChange={(e) => setFormData({ ...formData, supportedMethodsText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Channels & Capabilities Checklist */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Channel Capabilities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.qrSupported}
                    onChange={(e) => setFormData({ ...formData, qrSupported: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  BanglaQR
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mobileSupported}
                    onChange={(e) => setFormData({ ...formData, mobileSupported: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  MFS / App
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cardSupported}
                    onChange={(e) => setFormData({ ...formData, cardSupported: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Card Rails
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.apiSupported}
                    onChange={(e) => setFormData({ ...formData, apiSupported: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Direct API
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Description & Specifications
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of acquiring terms and settlement capabilities..."
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
                {saving && <RefreshCw size={14} className="animate-spin" />}
                {editingGateway ? "Update Gateway" : "Save Gateway to MySQL"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
