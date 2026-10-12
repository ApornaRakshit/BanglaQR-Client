import { useState, useEffect, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  Globe,
  Eye,
  EyeOff,
  Power,
  X,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveServiceLogo, resolveImageUrl } from "../../../utils/imageUtils";

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
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "gateway",
    serviceType: "Payment Gateway",
    status: "active",
    isPublished: true,
    acceptsApplications: true,
    displayOrder: 0,
    serviceFee: 1.5,
    setupFee: 0,
    logoUrl: "",
    shortDescription: "",
    description: "",
    eligibility: "",
    qrSupported: true,
    cardSupported: false,
    mobileSupported: true,
    apiSupported: true,
    supportedMethodsText: "BanglaQR, bKash App, USSD",
  });
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

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
      category: "gateway",
      serviceType: "Payment Gateway",
      status: "active",
      isPublished: true,
      acceptsApplications: true,
      displayOrder: 0,
      serviceFee: 1.5,
      setupFee: 0,
      logoUrl: "",
      shortDescription: "",
      description: "",
      eligibility: "",
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
      category: gw.category || "gateway",
      serviceType: gw.serviceType || gw.service_type || "Payment Gateway",
      status: gw.status || "active",
      isPublished: gw.isPublished ?? (gw.is_published !== undefined ? Boolean(gw.is_published) : true),
      acceptsApplications: gw.acceptsApplications ?? (gw.accepts_applications !== undefined ? Boolean(gw.accepts_applications) : true),
      displayOrder: gw.displayOrder ?? gw.display_order ?? 0,
      serviceFee: gw.serviceFee ?? gw.service_fee ?? 1.5,
      setupFee: gw.setupFee ?? gw.setup_fee ?? 0,
      logoUrl: gw.logoUrl || gw.logo_url || "",
      shortDescription: gw.shortDescription || gw.short_description || "",
      description: gw.description || "",
      eligibility: gw.eligibility || "",
      qrSupported: gw.qrSupported ?? Boolean(gw.qr_supported),
      cardSupported: gw.cardSupported ?? Boolean(gw.card_supported),
      mobileSupported: gw.mobileSupported ?? Boolean(gw.mobile_supported),
      apiSupported: gw.apiSupported ?? Boolean(gw.api_supported),
      supportedMethodsText: methods,
    });
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("media", file);
      const res = await adminApi.uploadCmsMedia(fd);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: uploadedUrl }));
        showToast("Logo image uploaded successfully.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload logo image.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleStatus = async (gw) => {
    const nextStatus = gw.status === "active" ? "inactive" : "active";
    try {
      await adminApi.updateGatewayStatus(gw.id, { status: nextStatus });
      showToast(`Gateway marked as ${nextStatus}.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    }
  };

  const handleTogglePublish = async (gw) => {
    const currentPub = gw.isPublished ?? Boolean(gw.is_published);
    const nextPub = !currentPub;
    try {
      await adminApi.updateGatewayPublish(gw.id, { isPublished: nextPub });
      showToast(nextPub ? "Gateway published to public marketplace." : "Gateway hidden from marketplace.");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update publish settings.");
    }
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
        category: formData.category,
        serviceType: formData.serviceType,
        status: formData.status,
        isPublished: Boolean(formData.isPublished),
        acceptsApplications: Boolean(formData.acceptsApplications),
        displayOrder: Number(formData.displayOrder) || 0,
        serviceFee: Number(formData.serviceFee) || 0,
        setupFee: Number(formData.setupFee) || 0,
        logoUrl: formData.logoUrl?.trim() || null,
        shortDescription: formData.shortDescription?.trim() || null,
        description: formData.description?.trim() || null,
        eligibility: formData.eligibility?.trim() || null,
        qrSupported: Boolean(formData.qrSupported),
        cardSupported: Boolean(formData.cardSupported),
        mobileSupported: Boolean(formData.mobileSupported),
        apiSupported: Boolean(formData.apiSupported),
        supportedMethods: methodsArray,
      };

      if (editingGateway) {
        await adminApi.updateGateway(editingGateway.id, payload);
        showToast(`Gateway "${payload.name}" updated successfully.`);
      } else {
        await adminApi.createGateway(payload);
        showToast(`Gateway "${payload.name}" created successfully.`);
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
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE "${name}"?\n\n- The gateway will be completely removed from the catalogue and public marketplace.\n- Historical merchant applications and provisioned services will be securely preserved.\n\nClick OK to confirm permanent deletion.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await adminApi.deleteGateway(id);
      showToast(res?.message || `Gateway "${name}" deleted successfully.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete gateway.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} />
          <span>{notification.message}</span>
        </div>
      )}

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
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm transition"
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inactive</p>
          <p className="text-2xl font-black text-slate-500 mt-1">
            {stats.inactiveGateways}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Drafts</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {stats.draftGateways}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Applications</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
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
          {gateways.map((gw) => {
            const resolvedLogo = resolveServiceLogo(gw.logoUrl || gw.logo_url, gw.code, gw.name);
            const isPub = gw.isPublished ?? Boolean(gw.is_published);
            const isActive = gw.status === "active";

            return (
              <div
                key={gw.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 p-1.5 shrink-0 overflow-hidden">
                        {resolvedLogo ? (
                          <img
                            src={resolvedLogo}
                            alt={gw.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-emerald-600">
                            {gw.code?.substring(0, 3).toUpperCase() || "GW"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                            {gw.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {gw.category || "gateway"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-400">{gw.code}</span>
                          {isPub ? (
                            <span className="text-[10px] text-emerald-600 font-semibold">• Marketplace</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">• Unlisted</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(gw)}
                      title={`Click to ${isActive ? "Deactivate" : "Activate"}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer hover:opacity-85 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                          : gw.status === "draft"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      <span className="capitalize">{gw.status}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                    {gw.shortDescription || gw.short_description || gw.description || "Digital payment gateway integrated for BanglaQR merchant settlements."}
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
                    {/* Toggle Marketplace Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(gw)}
                      className={`p-1.5 rounded-lg transition text-xs font-semibold flex items-center gap-1 ${
                        isPub
                          ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                      title={isPub ? "Published on Marketplace (Click to Unpublish)" : "Hidden from Marketplace (Click to Publish)"}
                    >
                      {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(gw)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      title="Edit Gateway"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Permanent Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(gw.id, gw.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      title="Permanently Delete Gateway"
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Gateway Logo Upload & Live Preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
                <span>Provider Logo / Brand Asset</span>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoUrl: "" }))}
                    className="text-[11px] text-red-500 hover:underline font-normal"
                  >
                    Clear Logo
                  </button>
                )}
              </label>

              <div className="flex items-center gap-3">
                {/* Logo Preview */}
                <div className="w-16 h-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                  {formData.logoUrl ? (
                    <img
                      src={resolveImageUrl(formData.logoUrl)}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : resolveServiceLogo("", formData.code, formData.name) ? (
                    <img
                      src={resolveServiceLogo("", formData.code, formData.name)}
                      alt="Default brand logo"
                      className="max-h-full max-w-full object-contain opacity-70"
                    />
                  ) : (
                    <ImageIcon size={22} className="text-slate-300" />
                  )}
                </div>

                {/* Upload or URL input */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <RefreshCw size={13} className="animate-spin text-emerald-600" />
                      ) : (
                        <Upload size={13} className="text-emerald-600" />
                      )}
                      <span>{uploadingLogo ? "Uploading..." : "Upload Logo Image"}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">or enter relative/external URL</span>
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. /uploads/cms/logo.png or https://..."
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Gateway Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. বিকাশ মার্চেন্ট পেমেন্ট"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Marketplace Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="bank">Bank (ব্যাংক)</option>
                  <option value="mfs">MFS (মোবাইল ফিন্যান্সিয়াল)</option>
                  <option value="gateway">Payment Gateway (গেটওয়ে)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bank MFS">Bank MFS / Acquiring</option>
                  <option value="MFS Gateway">MFS Gateway</option>
                  <option value="Card Gateway">Card Gateway</option>
                  <option value="Interoperable QR">Interoperable QR</option>
                  <option value="Payment Gateway">Payment Gateway</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  System Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  <option value="draft">Draft (খসড়া)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Show in Public Marketplace
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsApplications}
                    onChange={(e) => setFormData({ ...formData, acceptsApplications: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Accepts Applications
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Marketplace Short Description (Bengali or English)
              </label>
              <input
                type="text"
                placeholder="e.g. সরাসরি সিটি ব্যাংক অ্যাকাউন্ট থেকে বাংলা কিউআর পেমেন্ট গ্রহণ করুন"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
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
                placeholder="e.g. QR পেমেন্ট, মার্চেন্ট অ্যাকাউন্ট, API ইন্টিগ্রেশন"
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Eligibility & Merchant Requirements
              </label>
              <textarea
                rows={2}
                placeholder="e.g. বৈধ ট্রেড লাইসেন্স ও সক্রিয় কারেন্ট ব্যাংক অ্যাকাউন্ট থাকতে হবে..."
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving && <RefreshCw size={14} className="animate-spin" />}
                {editingGateway ? "Update Gateway" : "Save Gateway to Database"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
