import { useState, useEffect, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Power,
  X,
  CreditCard,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";

export default function AddonManagement() {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'applications' | 'orders' | 'payments'
  const [addons, setAddons] = useState([]);
  const [applications, setApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reconcilingId, setReconcilingId] = useState(null);
  const [stats, setStats] = useState({
    totalAddons: 0,
    activeAddons: 0,
    inactiveAddons: 0,
    publishedAddons: 0,
    pendingApplications: 0,
    activatedAddons: 0,
    totalOrders: 0,
    successfulPayments: 0,
    totalCollected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Operations",
    price: 0,
    pricingType: "monthly",
    billingCycle: "Monthly",
    logoUrl: "",
    status: "available",
    isPublished: true,
    acceptsApplications: true,
    displayOrder: 0,
    shortDescription: "",
    requirements: "",
    description: "",
    eligibility: "",
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
      const [addonRes, statsRes, appRes, ordersRes, paymentsRes] = await Promise.all([
        adminApi.getAddons({
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        adminApi.getAddonStats().catch(() => null),
        adminApi.getAddonApplications().catch(() => null),
        adminApi.getAddonOrders().catch(() => null),
        adminApi.getAddonPayments().catch(() => null),
      ]);

      const list = addonRes?.data || addonRes?.addons || (Array.isArray(addonRes) ? addonRes : []);
      setAddons(Array.isArray(list) ? list : []);

      const appList = appRes?.data || appRes?.applications || (Array.isArray(appRes) ? appRes : []);
      setApplications(Array.isArray(appList) ? appList : []);

      const orderList = ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : []);
      setOrders(Array.isArray(orderList) ? orderList : []);

      const paymentList = paymentsRes?.data || (Array.isArray(paymentsRes) ? paymentsRes : []);
      setPayments(Array.isArray(paymentList) ? paymentList : []);

      const successfulPayments = paymentList.filter((p) => p.status === "successful" || p.status === "paid");
      const totalCollected = successfulPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

      if (statsRes?.data) {
        setStats({
          ...statsRes.data,
          totalOrders: orderList.length,
          successfulPayments: successfulPayments.length,
          totalCollected,
        });
      } else {
        const active = list.filter((a) => a.status === "available" || a.status === "active").length;
        setStats({
          totalAddons: list.length,
          activeAddons: active,
          inactiveAddons: list.length - active,
          publishedAddons: active,
          pendingApplications: appList.filter((a) => a.status === "applied" || a.status === "under_review").length,
          activatedAddons: appList.filter((a) => a.status === "activated" || a.status === "approved").length,
          totalOrders: orderList.length,
          successfulPayments: successfulPayments.length,
          totalCollected,
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
      logoUrl: "",
      status: "available",
      isPublished: true,
      acceptsApplications: true,
      displayOrder: 0,
      shortDescription: "",
      requirements: "",
      description: "",
      eligibility: "",
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
      logoUrl: addon.logoUrl || addon.logo_url || "",
      status: addon.status || "available",
      isPublished: addon.isPublished ?? (addon.is_published !== undefined ? Boolean(addon.is_published) : true),
      acceptsApplications: addon.acceptsApplications ?? (addon.accepts_applications !== undefined ? Boolean(addon.accepts_applications) : true),
      displayOrder: addon.displayOrder ?? addon.display_order ?? 0,
      shortDescription: addon.shortDescription || addon.short_description || "",
      requirements: addon.requirements || "",
      description: addon.description || "",
      eligibility: addon.eligibility || "",
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
        showToast("Add-on logo/icon uploaded successfully.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload logo image.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleStatus = async (addon) => {
    const isActive = addon.status === "available" || addon.status === "active";
    const nextStatus = isActive ? "inactive" : "available";
    try {
      await adminApi.updateAddonStatus(addon.id, { status: nextStatus });
      showToast(`Add-on status set to ${nextStatus}.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update add-on status.");
    }
  };

  const handleTogglePublish = async (addon) => {
    const currentPub = addon.isPublished ?? Boolean(addon.is_published);
    const nextPub = !currentPub;
    try {
      await adminApi.updateAddonPublish(addon.id, { isPublished: nextPub });
      showToast(nextPub ? "Add-on published to public marketplace." : "Add-on hidden from marketplace.");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update publish settings.");
    }
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
        logoUrl: formData.logoUrl?.trim() || null,
        status: formData.status,
        isPublished: Boolean(formData.isPublished),
        acceptsApplications: Boolean(formData.acceptsApplications),
        displayOrder: Number(formData.displayOrder) || 0,
        shortDescription: formData.shortDescription?.trim() || null,
        requirements: formData.requirements?.trim() || null,
        description: formData.description?.trim() || null,
        eligibility: formData.eligibility?.trim() || null,
      };

      if (editingAddon) {
        await adminApi.updateAddon(editingAddon.id, payload);
        showToast(`Add-on "${payload.name}" updated successfully.`);
      } else {
        await adminApi.createAddon(payload);
        showToast(`Add-on "${payload.name}" created successfully.`);
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
    const confirmMsg = `Are you sure you want to PERMANENTLY DELETE "${name}"?\n\n- The add-on will be completely removed from the catalogue and public marketplace.\n- Historical merchant applications will remain safely preserved in merchant records.\n\nClick OK to confirm permanent deletion.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminApi.deleteAddon(id);
      showToast(res?.message || `Add-on "${name}" deleted successfully.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete add-on.");
    }
  };

  const handleReviewApp = async (appId, action) => {
    try {
      await adminApi.reviewAddonApplication(appId, { action });
      showToast(`Add-on application marked as ${action}.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update add-on application status.");
    }
  };

  const handleReviewOrder = async (orderId, action) => {
    try {
      await adminApi.reviewAddonOrder(orderId, { action });
      showToast(`Order status updated to ${action}.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update order status.");
    }
  };

  const handleReconcilePayment = async (paymentId) => {
    try {
      setReconcilingId(paymentId);
      const res = await adminApi.reconcileAddonPayment(paymentId);
      showToast(res?.message || `Payment reconciled with DGePay successfully.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reconcile payment with DGePay.");
    } finally {
      setReconcilingId(null);
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
            Create Add-on
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Catalog</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Services</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.activeAddons}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Merchant Apps</p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {stats.pendingApplications}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Successful Txns</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {stats.successfulPayments}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue (BDT)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ৳{Number(stats.totalCollected || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === "catalog"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Layers size={16} />
          Catalog Products ({addons.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === "applications"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <PackageCheck size={16} />
          Merchant Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === "orders"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Sparkles size={16} />
          Orders & Subscriptions ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === "payments"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <CreditCard size={16} />
          DGePay Payments ({payments.length})
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
                const isPub = addon.isPublished ?? Boolean(addon.is_published);
                const isMonthly = (addon.pricingType || addon.pricing_type) === "monthly";
                const isOneTime = (addon.pricingType || addon.pricing_type) === "one_time";
                const isFree = (addon.pricingType || addon.pricing_type) === "free";
                const resolvedLogo = resolveImageUrl(addon.logoUrl || addon.logo_url);

                return (
                  <div
                    key={addon.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {resolvedLogo ? (
                            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                              <img
                                src={resolvedLogo}
                                alt={addon.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          ) : null}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {addon.category || "Operations"}
                            </span>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5 leading-snug">
                              {addon.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono text-slate-400">{addon.code}</span>
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
                          onClick={() => handleToggleStatus(addon)}
                          title={`Click to ${isActive ? "Deactivate" : "Activate"}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer hover:opacity-85 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                          <span className="capitalize">{addon.status}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                        {addon.shortDescription || addon.short_description || addon.description || "Enhanced BanglaQR operations feature."}
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
                        {/* Toggle Marketplace Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(addon)}
                          className={`p-1.5 rounded-lg transition text-xs font-semibold flex items-center gap-1 ${
                            isPub
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                          title={isPub ? "Published on Marketplace (Click to Unpublish)" : "Hidden from Marketplace (Click to Publish)"}
                        >
                          {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(addon)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit Addon"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(addon.id, addon.name)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Permanently Delete Addon"
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
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Merchant Application Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">Review and activate requested value-added extensions.</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300">
                {applications.length} Requests Total
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <PackageCheck size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No active add-on applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                      <th className="p-3.5">Ref / Merchant</th>
                      <th className="p-3.5">Add-on Item</th>
                      <th className="p-3.5">Pricing</th>
                      <th className="p-3.5">Applied Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{app.companyName || "Merchant"}</p>
                          <p className="font-mono text-slate-400">{app.merchantCode}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{app.addonName}</p>
                          <span className="text-[10px] text-emerald-600 font-semibold">{app.category}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                          ৳{Number(app.price || 0).toLocaleString()} ({app.pricingType})
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === "activated" || app.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "applied" || app.status === "under_review"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {app.status !== "activated" && app.status !== "approved" && (
                            <button
                              onClick={() => handleReviewApp(app.id, "activate")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-2xs"
                            >
                              Activate
                            </button>
                          )}
                          {app.status === "activated" && (
                            <button
                              onClick={() => handleReviewApp(app.id, "suspend")}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Orders & Subscriptions */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Add-on Orders & Subscriptions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative MySQL subscription orders created by merchants</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                {orders.length} Total Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Sparkles size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No add-on orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                      <th className="p-3.5">Order Number</th>
                      <th className="p-3.5">Merchant</th>
                      <th className="p-3.5">Add-on Service</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Billing Cycle</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {ord.order_number}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{ord.company_name || "Merchant"}</p>
                          <p className="font-mono text-slate-400">{ord.merchant_code}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{ord.addon_name}</p>
                          <span className="text-[10px] text-emerald-600 font-semibold">{ord.addon_code}</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          ৳{Number(ord.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 capitalize text-slate-600 dark:text-slate-300">
                          {ord.billing_cycle || "Monthly"}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              ord.status === "active" || ord.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.status === "pending_payment"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {ord.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(ord.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {ord.status !== "active" && ord.status !== "paid" && (
                            <button
                              onClick={() => handleReviewOrder(ord.id, "activate")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-2xs"
                              title="Manually verify & activate"
                            >
                              Activate
                            </button>
                          )}
                          {ord.status === "pending_payment" && (
                            <button
                              onClick={() => handleReviewOrder(ord.id, "cancel")}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px]"
                              title="Cancel order"
                            >
                              Cancel
                            </button>
                          )}
                          {ord.status === "active" && (
                            <button
                              onClick={() => handleReviewOrder(ord.id, "suspend")}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[11px]"
                              title="Suspend subscription"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: DGePay Payments */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">DGePay Online Payment Transactions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live transaction tracking with authoritative DGePay query & reconciliation</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                {payments.length} Payments
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CreditCard size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No payment transactions recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase font-bold tracking-wider">
                      <th className="p-3.5">Payment Ref</th>
                      <th className="p-3.5">Order / Merchant</th>
                      <th className="p-3.5">Gateway</th>
                      <th className="p-3.5">Gateway Txn ID</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {pay.payment_reference}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">{pay.company_name || `Merchant #${pay.merchant_id}`}</p>
                          <p className="font-mono text-slate-400">{pay.order_number || `Order #${pay.order_id}`}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {pay.gateway || "DGePay"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          {pay.gateway_unique_txn_id || "N/A"}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          ৳{Number(pay.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              pay.status === "successful"
                                ? "bg-emerald-100 text-emerald-800"
                                : pay.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(pay.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleReconcilePayment(pay.id)}
                            disabled={reconcilingId === pay.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-bold text-[11px] shadow-2xs transition"
                            title="Query DGePay status inquiry API and synchronize state"
                          >
                            <RefreshCw size={12} className={reconcilingId === pay.id ? "animate-spin" : ""} />
                            {reconcilingId === pay.id ? "Reconciling..." : "Reconcile DGePay"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Addon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingAddon ? "Edit Add-on Service" : "Create Add-on Service"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Logo / Icon Upload & Live Preview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
                <span>Add-on Icon / Media Asset</span>
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
                  ) : (
                    <Sparkles size={22} className="text-emerald-500" />
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
                    placeholder="e.g. /uploads/cms/addon_icon.png or https://..."
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
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BanglaQR Voice SoundBox Terminal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Service Code *
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <option value="Accounting">Accounting & Recon</option>
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
                  <option value="available">Available / Active</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
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

            <div className="flex items-center gap-4 py-1">
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Marketplace Short Description (Bengali / English)
              </label>
              <input
                type="text"
                placeholder="e.g. বাংলা কিউআর পেমেন্ট তাৎক্ষণিক বাংলা অডিও বার্তা সহ শুনুন"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
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
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
