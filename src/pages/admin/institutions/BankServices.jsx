import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Network,
  Search,
  Landmark,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Unlink,
  Link as LinkIcon,
  Check,
  CreditCard,
  Plus,
  Eye,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Edit,
  Building2,
  Server,
  Info,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";

export default function BankServices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInstitutionId = searchParams.get("institutionId") || "all";

  const [services, setServices] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialInstitutionId);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [operationalFilter, setOperationalFilter] = useState("all");

  // Modals
  const [associatingGateway, setAssociatingGateway] = useState(null);
  const [targetBankId, setTargetBankId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [viewingService, setViewingService] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    code: "",
    name: "",
    category: "bank",
    fee_percentage: "1.50",
    fee_flat: "0.00",
    settlement_days: "1",
    logo_url: "",
    description: "",
    status: "active",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [testingServiceId, setTestingServiceId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [servicesRes, instRes] = await Promise.all([
        adminApi.getInstitutionServices({
          institutionId: selectedInstitutionId !== "all" ? selectedInstitutionId : undefined,
        }),
        adminApi.getInstitutions({ limit: 100 }),
      ]);

      const svcList = servicesRes?.data || servicesRes?.services || servicesRes || [];
      const bankList = instRes?.data || instRes?.institutions || instRes || [];

      setServices(Array.isArray(svcList) ? svcList : []);
      setInstitutions(Array.isArray(bankList) ? bankList : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bank services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitutionId]);

  const handleFilterChange = (id) => {
    setSelectedInstitutionId(id);
    if (id === "all") {
      searchParams.delete("institutionId");
    } else {
      searchParams.set("institutionId", id);
    }
    setSearchParams(searchParams);
  };

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setServiceFormData({
      code: "",
      name: "",
      category: "bank",
      fee_percentage: "1.50",
      fee_flat: "0.00",
      settlement_days: "1",
      logo_url: "",
      description: "",
      status: "active",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (svc) => {
    setEditingService(svc);
    setServiceFormData({
      code: svc.code || "",
      name: svc.name || "",
      category: svc.category || "bank",
      fee_percentage: svc.fee_percentage !== undefined ? String(svc.fee_percentage) : "1.50",
      fee_flat: svc.fee_flat !== undefined ? String(svc.fee_flat) : "0.00",
      settlement_days: svc.settlement_days !== undefined ? String(svc.settlement_days) : "1",
      logo_url: svc.logo_url || "",
      description: svc.description || "",
      status: svc.status || "active",
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingService) {
        await adminApi.updateInstitutionService(editingService.id, serviceFormData);
        showToast(`Service "${serviceFormData.name}" updated successfully.`);
      } else {
        await adminApi.createInstitutionService(serviceFormData);
        showToast(`Service "${serviceFormData.name}" created successfully.`);
      }
      setIsFormModalOpen(false);
      setEditingService(null);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save service.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleTestConnection = async (svc) => {
    setTestingServiceId(svc.id);
    setTestResult(null);
    try {
      const res = await adminApi.testInstitutionServiceConnection(svc.id);
      const resData = res?.data || res;
      setTestResult({
        serviceName: svc.name,
        code: svc.code,
        ...resData,
      });
      showToast(`Connection test for ${svc.name}: ${resData?.message || "Handshake successful"}`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Connection test failed.");
    } finally {
      setTestingServiceId(null);
    }
  };

  const handleAssociate = async (e) => {
    e.preventDefault();
    if (!associatingGateway || !targetBankId) return;

    setActionLoading(true);
    try {
      await adminApi.associateInstitutionService(associatingGateway.id, targetBankId);
      showToast(`Service "${associatingGateway.name}" successfully linked.`);
      setAssociatingGateway(null);
      setTargetBankId("");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to link service to institution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisassociate = async (gw) => {
    const instName = gw.institution_name || "the assigned institution";
    if (!window.confirm(`Disassociate service "${gw.name}" from ${instName}?`)) return;

    try {
      await adminApi.disassociateInstitutionService(gw.id);
      showToast(`Service "${gw.name}" unlinked successfully.`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to disassociate service.");
    }
  };

  // Helper for dynamic contextual button text
  const getContextualActionLabel = (svc) => {
    const isAssigned = Boolean(svc.institution_id);
    const cat = (svc.category || "").toLowerCase();
    const isMfs = cat === "mfs" || cat === "wallet";
    const isBank = cat === "bank";

    if (isMfs) {
      return isAssigned ? "Change MFS" : "Link MFS Provider";
    }
    if (isBank) {
      return isAssigned ? "Change Bank" : "Link Bank";
    }
    return isAssigned ? "Change Institution" : "Link Institution";
  };

  const getConnectionBadge = (status, env) => {
    switch (status) {
      case "connected":
        return {
          label: env === "production" ? "Production Live" : "Connected (Sandbox)",
          class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          dot: "bg-emerald-500",
        };
      case "testing":
        return {
          label: "Testing (Sandbox)",
          class: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
          dot: "bg-sky-500",
        };
      case "setup_pending":
        return {
          label: "Setup Pending",
          class: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          dot: "bg-amber-500",
        };
      case "suspended":
        return {
          label: "Suspended",
          class: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          dot: "bg-rose-500",
        };
      case "not_connected":
      default:
        return {
          label: "Not Connected",
          class: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
          dot: "bg-slate-400",
        };
    }
  };

  const filteredServices = services.filter((s) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchCode = s.code?.toLowerCase().includes(q);
      const matchInst = s.institution_name?.toLowerCase().includes(q);
      const matchParent = s.parent_bank_name?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchInst && !matchParent) return false;
    }

    // Category
    if (categoryFilter !== "all") {
      if (categoryFilter === "bank" && s.category !== "bank") return false;
      if (categoryFilter === "mfs" && s.category !== "mfs" && s.category !== "wallet") return false;
      if (categoryFilter === "card" && s.category !== "card" && s.category !== "card_scheme") return false;
    }

    // Connection Status
    if (connectionFilter !== "all") {
      const connStatus = s.connection_status || "not_connected";
      if (connStatus !== connectionFilter) return false;
    }

    // Operational Status
    if (operationalFilter !== "all") {
      if (s.status !== operationalFilter) return false;
    }

    return true;
  });

  // KPI calculations
  const totalCount = services.length;
  const bankRailsCount = services.filter((s) => s.category === "bank").length;
  const mfsGatewaysCount = services.filter((s) => s.category === "mfs" || s.category === "wallet").length;
  const sandboxTestingCount = services.filter((s) => s.connection_status === "testing").length;
  const setupPendingCount = services.filter((s) => s.connection_status === "setup_pending").length;
  const unassignedCount = services.filter((s) => !s.institution_id).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Network size={24} />
            </div>
            Institution Services & Gateways
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Service catalogue, payment rail mappings, technical handshake monitoring, and MFS parent-bank connections
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Real Statistics / KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Total Services
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {totalCount}
          </span>
          <span className="text-[10px] text-slate-400">Catalogue entries</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
            Bank QR Rails
          </span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1 block">
            {bankRailsCount}
          </span>
          <span className="text-[10px] text-slate-400">Direct BB QR</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block">
            MFS Providers
          </span>
          <span className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1 block">
            {mfsGatewaysCount}
          </span>
          <span className="text-[10px] text-slate-400">bKash, Rocket, Upay</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 block">
            Testing (Sandbox)
          </span>
          <span className="text-xl font-bold text-sky-700 dark:text-sky-300 mt-1 block">
            {sandboxTestingCount}
          </span>
          <span className="text-[10px] text-slate-400">Simulated rails</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
            Setup Pending
          </span>
          <span className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1 block">
            {setupPendingCount}
          </span>
          <span className="text-[10px] text-slate-400">Config in progress</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
            Unassigned
          </span>
          <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1 block">
            {unassignedCount}
          </span>
          <span className="text-[10px] text-slate-400">Needs institution</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service name, code, bank or MFS provider..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="bank">Bank QR Rails</option>
              <option value="mfs">MFS Gateways</option>
              <option value="card">Card Schemes</option>
            </select>
          </div>

          {/* Connection Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Technical Connection:</span>
            <select
              value={connectionFilter}
              onChange={(e) => setConnectionFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Connections</option>
              <option value="testing">Testing (Sandbox)</option>
              <option value="setup_pending">Setup Pending</option>
              <option value="connected">Connected</option>
              <option value="not_connected">Not Connected</option>
            </select>
          </div>

          {/* Institution Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Institution:</span>
            <select
              value={selectedInstitutionId}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="max-w-[180px] px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">All Partners</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.institution_code || inst.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchData}
            title="Refresh Services"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {/* Integration Disclosure Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Integration Status Notice:</span> Technical service connections listed as{" "}
          <strong className="underline">Testing (Sandbox)</strong> simulate API message formats and payload schemas. Production settlement rails require completed bilateral SLA and production certificate exchange.
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Gateway / Service Rail</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Assigned Bank / Provider</th>
                <th className="py-3.5 px-3">Technical Connection</th>
                <th className="py-3.5 px-3">Partnership</th>
                <th className="py-3.5 px-3">Apps</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs">Loading institution services catalogue...</p>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Network size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No services match the selected filters
                    </p>
                    <p className="text-xs mt-1">Adjust your search query or category filters.</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((svc) => {
                  const hasBank = Boolean(svc.institution_id);
                  const connBadge = getConnectionBadge(svc.connection_status, svc.connection_environment);
                  const isMfs = svc.category === "mfs" || svc.category === "wallet";

                  return (
                    <tr
                      key={svc.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Service / Gateway Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {svc.logo_url ? (
                              <img
                                src={resolveImageUrl(svc.logo_url)}
                                alt={svc.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <CreditCard size={18} className="text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {svc.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400">
                                {svc.code}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Fee: {svc.fee_percentage}% + ৳{svc.fee_flat}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            svc.category === "bank"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : svc.category === "mfs" || svc.category === "wallet"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {svc.category === "bank"
                            ? "Bank QR Rail"
                            : svc.category === "mfs" || svc.category === "wallet"
                            ? "MFS Gateway"
                            : "Card Acquirer"}
                        </span>
                      </td>

                      {/* Assigned Bank / MFS Provider with Parent Bank indicator */}
                      <td className="py-3.5 px-3">
                        {hasBank ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Landmark size={13} />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                                  {svc.institution_name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {svc.institution_code}
                                </span>
                              </div>
                            </div>

                            {/* Show Parent Bank for MFS if applicable */}
                            {isMfs && svc.parent_bank_name && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                <Building2 size={11} className="text-slate-400" />
                                <span>Parent Bank: <strong className="text-slate-700 dark:text-slate-300">{svc.parent_bank_name}</strong></span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-900/40">
                            <AlertCircle size={11} />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Technical Connection Status */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${connBadge.class}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${connBadge.dot}`} />
                            <span>{connBadge.label}</span>
                          </span>

                          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Server size={10} />
                            <span>
                              {svc.connection_environment ? svc.connection_environment.toUpperCase() : "SANDBOX"}
                            </span>
                            {svc.last_tested_at && (
                              <span className="text-[9px] text-slate-500">
                                • {new Date(svc.last_tested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Partnership & Directory Status */}
                      <td className="py-3.5 px-3">
                        {hasBank ? (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                svc.institution_partnership_status === "active_partner"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : svc.institution_partnership_status === "mou_signed"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {svc.institution_partnership_status === "active_partner"
                                ? "Active Partner"
                                : svc.institution_partnership_status === "mou_signed"
                                ? "MOU Signed"
                                : "In Discussion"}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              Directory: {svc.institution_directory_status || "listed"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Merchant Applications */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Layers size={12} />
                          <span>{svc.applications_count || 0}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Handshake Button */}
                          <button
                            type="button"
                            onClick={() => handleTestConnection(svc)}
                            disabled={testingServiceId === svc.id}
                            title="Test Technical Handshake"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition disabled:opacity-50"
                          >
                            <Zap
                              size={13}
                              className={testingServiceId === svc.id ? "animate-pulse text-amber-500" : ""}
                            />
                          </button>

                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setViewingService(svc)}
                            title="View Full Specifications"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit Service Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(svc)}
                            title="Edit Service Parameters"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit size={13} />
                          </button>

                          {/* Contextual Link Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAssociatingGateway(svc);
                              setTargetBankId(svc.institution_id ? String(svc.institution_id) : "");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                          >
                            <LinkIcon size={12} />
                            <span>{getContextualActionLabel(svc)}</span>
                          </button>

                          {/* Unlink Button */}
                          {hasBank && (
                            <button
                              type="button"
                              onClick={() => handleDisassociate(svc)}
                              title="Unlink from Institution"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                            >
                              <Unlink size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-center shadow-xs shrink-0">
                  {viewingService.logo_url ? (
                    <img
                      src={resolveImageUrl(viewingService.logo_url)}
                      alt={viewingService.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <CreditCard size={24} className="text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {viewingService.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {viewingService.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {viewingService.status || "active"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Financial Specifications */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-600" />
                  Service & Fee Parameters
                </h4>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold capitalize">{viewingService.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Percentage Fee:</span>
                    <span className="font-semibold">{viewingService.fee_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flat Fee:</span>
                    <span className="font-semibold">BDT {viewingService.fee_flat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement Cycle:</span>
                    <span className="font-semibold">T+{viewingService.settlement_days || 1} Day(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linked Applications:</span>
                    <span className="font-semibold">{viewingService.applications_count || 0} Merchants</span>
                  </div>
                </div>
              </div>

              {/* Institution Association */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Landmark size={14} className="text-blue-600" />
                  Mapped Institution
                </h4>
                {viewingService.institution_id ? (
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="font-semibold">{viewingService.institution_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Code:</span>
                      <span className="font-mono font-semibold">{viewingService.institution_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="capitalize">{viewingService.institution_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Partnership Status:</span>
                      <span className="capitalize font-semibold text-emerald-600">
                        {viewingService.institution_partnership_status || "Active Partner"}
                      </span>
                    </div>
                    {viewingService.parent_bank_name && (
                      <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">Parent Sponsoring Bank:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {viewingService.parent_bank_name}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No institution currently assigned to this rail.</p>
                )}
              </div>

              {/* Technical Connection Handshake Details */}
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server size={14} className="text-purple-600" />
                  Technical Connection & Handshake Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Connection State</span>
                    <span className="font-bold capitalize text-slate-900 dark:text-white">
                      {viewingService.connection_status || "not_connected"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Environment</span>
                    <span className="font-bold uppercase text-slate-900 dark:text-white">
                      {viewingService.connection_environment || "SANDBOX"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Connection Mode</span>
                    <span className="font-bold uppercase text-slate-900 dark:text-white">
                      {viewingService.connection_mode || "REST_JSON"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Last Handshake</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {viewingService.last_tested_at
                        ? new Date(viewingService.last_tested_at).toLocaleString()
                        : "Never tested"}
                    </span>
                  </div>
                </div>

                {viewingService.connection_notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    Note: {viewingService.connection_notes}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleTestConnection(viewingService)}
                disabled={testingServiceId === viewingService.id}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition disabled:opacity-50"
              >
                <Zap size={14} className={testingServiceId === viewingService.id ? "animate-spin" : ""} />
                <span>{testingServiceId === viewingService.id ? "Testing Handshake..." : "Test Sandbox Handshake"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const svc = viewingService;
                    setViewingService(null);
                    handleOpenEditModal(svc);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
                >
                  Edit Service
                </button>
                <button
                  type="button"
                  onClick={() => setViewingService(null)}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Connection Result Alert / Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Handshake Successful
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {testResult.serviceName} ({testResult.code})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600">{testResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono font-semibold uppercase">{testResult.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Simulated Latency:</span>
                <span className="font-mono font-bold">{testResult.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-500">{new Date(testResult.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                {testResult.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Network size={18} className="text-emerald-600" />
                <span>{editingService ? "Edit Service Parameters" : "Add New Payment Rail / Service"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.code}
                    disabled={Boolean(editingService)}
                    onChange={(e) =>
                      setServiceFormData({ ...serviceFormData, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })
                    }
                    placeholder="e.g. BRAC_BANK_QR"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bank">Bank QR Rail</option>
                    <option value="mfs">MFS Gateway</option>
                    <option value="card">Card Scheme / Acquirer</option>
                    <option value="other">Other FinTech</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. BRAC Bank Bangla QR Rail"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceFormData.fee_percentage}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, fee_percentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Flat Fee (BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceFormData.fee_flat}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, fee_flat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Settlement (Days)
                  </label>
                  <input
                    type="number"
                    value={serviceFormData.settlement_days}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, settlement_days: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={serviceFormData.logo_url}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, logo_url: e.target.value })}
                  placeholder="/uploads/institutions/logo.png"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Features
                </label>
                <textarea
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="Official Bangladesh Bank interoperable QR standard rail..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={serviceFormData.status}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{formSubmitting ? "Saving..." : editingService ? "Update Service" : "Create Service"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contextual Link Modal (Bank / MFS Provider) */}
      {associatingGateway && (() => {
        const cat = (associatingGateway.category || "").toLowerCase();
        const isMfs = cat === "mfs" || cat === "wallet";
        const isBank = cat === "bank";
        const modalTitle = isMfs
          ? "Link MFS Provider"
          : isBank
          ? "Assign Banking Partner"
          : "Assign Institution";

        const selectedInstObj = institutions.find((i) => String(i.id) === String(targetBankId));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Landmark size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect rail <strong className="text-slate-900 dark:text-white">{associatingGateway.name}</strong> to an institution
                  </p>
                </div>
              </div>

              <form onSubmit={handleAssociate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select {isMfs ? "MFS Provider / Payment Entity" : "Bank / Financial Institution"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetBankId}
                    onChange={(e) => setTargetBankId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Partner --</option>
                    {institutions.map((inst) => {
                      const instType = inst.institution_type || inst.type || "bank";
                      return (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.institution_code || inst.code}) [{instType}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Dynamic Selection Preview with Parent Bank info */}
                {selectedInstObj && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedInstObj.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Code: {selectedInstObj.institution_code || selectedInstObj.code}</span>
                      <span className="capitalize">{selectedInstObj.institution_type || selectedInstObj.type}</span>
                    </div>
                    {selectedInstObj.parent_bank_name && (
                      <div className="pt-1.5 mt-1 border-t border-slate-200 dark:border-slate-700 text-[11px] text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                        <Building2 size={12} />
                        <span>Sponsoring Parent Bank: {selectedInstObj.parent_bank_name}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssociatingGateway(null);
                      setTargetBankId("");
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !targetBankId}
                    className="flex items-center gap-1.5 px-5 py-2 font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>{actionLoading ? "Linking..." : "Confirm Link"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
