import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  Sliders,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Building2,
  Clock,
  Coins,
  Mail,
  Link2,
  Settings,
  ShieldCheck,
  FileText,
  FileCheck,
  Info,
  RotateCcw,
  ExternalLink,
  Search,
  ChevronDown,
  Check,
  UserCheck,
  RotateCw,
  Network,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";

export default function BankSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("institutionId");

  const [institutions, setInstitutions] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(initialId || "");
  const [currentBankDetails, setCurrentBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  // Searchable dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // Settings State
  const [settings, setSettings] = useState({
    sla_hours: 24,
    branch_policy: "auto_assign_nearest_branch",
    settlementSchedule: "Real-time (NPSB Instant)",
    onboardingSla: "24 Hours (Standard)",
    autoApprovalLimit: 50000,
    escalationEmail: "",
    webhookUrl: "",
    apiBaseUrl: "",
    complianceNotes: "",
    enableAutoVerification: true,
    requirePhysicalVisit: false,
  });

  // Keep track of loaded settings for the Reset action
  const [initialSettings, setInitialSettings] = useState(null);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Load Institutions List
  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getInstitutions({ limit: 100, category: "banks" });
        const list = res?.data?.institutions || res?.institutions || res?.data || res || [];
        const bankList = Array.isArray(list) ? list : [];
        setInstitutions(bankList);

        if (bankList.length > 0) {
          // If query param exists, try to match it; otherwise prefer EBL (id: 26) or first bank
          if (initialId && bankList.some((b) => String(b.id) === String(initialId))) {
            setSelectedBankId(String(initialId));
          } else {
            const ebl = bankList.find((b) => b.code === "EBL" || b.institution_code === "EBL" || b.name?.includes("Eastern Bank"));
            const defaultId = ebl ? String(ebl.id) : String(bankList[0].id);
            setSelectedBankId(defaultId);
          }
        }
      } catch (err) {
        setError("Failed to load banking institutions.");
      } finally {
        setLoading(false);
      }
    };
    loadBanks();
  }, []);

  // 2. Load Selected Institution Settings
  const loadBankSettings = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getInstitutionSettings(id);
      const data = res?.data?.settings || res?.settings || res?.data || {};
      const instData = res?.data?.institution || res?.institution || null;
      if (instData) {
        setCurrentBankDetails(instData);
      }

      // Branch policy normalization
      const rawPolicy = data.branch_policy || data.branch_routing_policy || "auto_assign_nearest_branch";
      let branchPolicy = rawPolicy;
      if (rawPolicy === "optional") branchPolicy = "merchant_selects_branch";
      if (rawPolicy === "mandatory") branchPolicy = "auto_assign_nearest_branch";
      if (rawPolicy === "disabled") branchPolicy = "manual_assignment";

      const loadedState = {
        ...data,
        sla_hours: data.sla_hours !== undefined ? Number(data.sla_hours) : data.kyc_review_sla_hours !== undefined ? Number(data.kyc_review_sla_hours) : 24,
        branch_policy: branchPolicy,
        settlementSchedule: data.settlementSchedule || "Real-time (NPSB Instant)",
        onboardingSla: data.onboardingSla || "24 Hours (Standard)",
        autoApprovalLimit: data.autoApprovalLimit !== undefined ? Number(data.autoApprovalLimit) : 50000,
        escalationEmail: data.escalationEmail || data.escalation_email || data.operations_escalation_email || "escalations@bank.com",
        webhookUrl: data.webhookUrl || "https://api.bank.com/v1/banglaqr/webhook",
        apiBaseUrl: data.apiBaseUrl || "https://gateway.bank.com/api",
        complianceNotes: data.complianceNotes || "",
        enableAutoVerification: data.enableAutoVerification !== undefined ? Boolean(data.enableAutoVerification) : true,
        requirePhysicalVisit: Boolean(data.requirePhysicalVisit),
      };

      setSettings(loadedState);
      setInitialSettings(loadedState);
    } catch (err) {
      console.warn("Could not load institution settings:", err);
      setError("Failed to load settings for the selected bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBankId) {
      loadBankSettings(selectedBankId);
      searchParams.set("institutionId", selectedBankId);
      setSearchParams(searchParams, { replace: true });
    }
  }, [selectedBankId]);

  // Handle standard field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Reset to last successfully loaded/saved state
  const handleReset = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      showToast("Settings reverted to last saved state", "info");
    }
  };

  // Save Settings to Backend
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBankId) return;

    const slaNum = Number(settings.sla_hours);
    if (!Number.isInteger(slaNum) || slaNum < 1 || slaNum > 720) {
      alert("KYC Review Target SLA must be a positive integer between 1 and 720 hours (max 30 days).");
      return;
    }

    if (
      settings.escalationEmail &&
      settings.escalationEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.escalationEmail.trim())
    ) {
      alert("Please enter a valid Operations Contact / Escalation Email.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...settings,
        sla_hours: slaNum,
        kyc_review_sla_hours: slaNum,
        branch_policy: settings.branch_policy || "auto_assign_nearest_branch",
        branch_routing_policy: settings.branch_policy || "auto_assign_nearest_branch",
        settlementSchedule: settings.settlementSchedule,
        onboardingSla: settings.onboardingSla,
        autoApprovalLimit: Number(settings.autoApprovalLimit) || 0,
        escalationEmail: settings.escalationEmail ? settings.escalationEmail.trim() : "",
        escalation_email: settings.escalationEmail ? settings.escalationEmail.trim() : "",
        webhookUrl: settings.webhookUrl ? settings.webhookUrl.trim() : "",
        apiBaseUrl: settings.apiBaseUrl ? settings.apiBaseUrl.trim() : "",
        complianceNotes: settings.complianceNotes || "",
        enableAutoVerification: Boolean(settings.enableAutoVerification),
        requirePhysicalVisit: Boolean(settings.requirePhysicalVisit),
      };

      await adminApi.updateInstitutionSettings(selectedBankId, payload);
      setInitialSettings(payload);
      showToast("Bank operational settings saved successfully.");
      await loadBankSettings(selectedBankId);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save bank settings.");
    } finally {
      setSaving(false);
    }
  };

  // Current selected bank object
  const currentBank = currentBankDetails || institutions.find((b) => String(b.id) === String(selectedBankId));

  // Filtered institutions for searchable dropdown
  const filteredBanks = useMemo(() => {
    if (!dropdownSearch.trim()) return institutions;
    const term = dropdownSearch.toLowerCase();
    return institutions.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.institution_code?.toLowerCase().includes(term) ||
        b.code?.toLowerCase().includes(term) ||
        b.type?.toLowerCase().includes(term)
    );
  }, [institutions, dropdownSearch]);

  const formatBankType = (type, category) => {
    if (category) {
      return category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (!type) return "Commercial Bank";
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="w-full space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Title Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 shrink-0">
          <Sliders size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bank Operational Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure acquiring SLAs, settlement cycles, webhook callbacks, and risk policies per bank
          </p>
        </div>
      </div>

      {/* Select Bank Card with Searchable Dropdown */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Select Bank</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a registered bank to view or configure its operational settings
            </p>
          </div>
        </div>

        {/* Custom Searchable Dropdown */}
        <div className="relative w-full md:w-96" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {currentBank?.logo_url ? (
                <img
                  src={resolveImageUrl(currentBank.logo_url)}
                  alt={currentBank.name}
                  className="w-5 h-5 rounded object-contain shrink-0"
                />
              ) : (
                <Landmark size={15} className="text-emerald-600 shrink-0" />
              )}
              <span className="truncate">
                {currentBank
                  ? `${currentBank.name} (${currentBank.code || currentBank.institution_code}) - ${formatBankType(
                      currentBank.type,
                      currentBank.bank_category
                    ).toUpperCase()}`
                  : "Select a Bank..."}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 max-h-80 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                <div className="relative">
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Search bank by name, code..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                </div>
              </div>

              <div className="overflow-y-auto max-h-60 divide-y divide-slate-100/50 dark:divide-slate-700/50">
                {filteredBanks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No matching banks found</div>
                ) : (
                  filteredBanks.map((b) => {
                    const isSelected = String(b.id) === String(selectedBankId);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBankId(String(b.id));
                          setIsDropdownOpen(false);
                          setDropdownSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-slate-50 dark:hover:bg-slate-750 ${
                          isSelected
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {b.logo_url ? (
                            <img
                              src={resolveImageUrl(b.logo_url)}
                              alt={b.name}
                              className="w-5 h-5 rounded object-contain shrink-0"
                            />
                          ) : (
                            <Landmark size={15} className="text-slate-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-semibold">{b.name}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                              ({b.code || b.institution_code})
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      {currentBank ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Operational Configuration Form (8 cols) */}
          <div className="lg:col-span-8">
            <form
              onSubmit={handleSave}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Operational Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Set SLAs, settlement cycles, verification policies and integration parameters for{" "}
                    <span className="text-emerald-600 font-semibold">{currentBank.name}</span>
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. KYC Review Target SLA (Hours) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-600 shrink-0" />
                    <span>KYC Review Target SLA (Hours)</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="720"
                      name="sla_hours"
                      value={settings.sla_hours}
                      onChange={handleChange}
                      className="w-full pr-14 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400">
                      Hours
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Target time to complete KYC review for merchant applications
                  </p>
                </div>

                {/* 2. Branch Routing Policy */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Network size={14} className="text-emerald-600 shrink-0" />
                    <span>Branch Routing Policy</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    name="branch_policy"
                    value={settings.branch_policy || "auto_assign_nearest_branch"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="auto_assign_nearest_branch">
                      Automatic — Auto-assign nearest branch by location
                    </option>
                    <option value="merchant_selects_branch">
                      Optional — Merchant selects nearest branch
                    </option>
                    <option value="manual_assignment">
                      Manual — Head office / bank reviewer assigns branch
                    </option>
                  </select>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Policy for assigning merchants to bank branches
                  </p>
                </div>

                {/* 3. Settlement Schedule Cycle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <RotateCw size={14} className="text-emerald-600 shrink-0" />
                    <span>Settlement Schedule Cycle</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    name="settlementSchedule"
                    value={settings.settlementSchedule}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Real-time (NPSB Instant)">Real-time (NPSB Instant)</option>
                    <option value="T+0 Same Day">T+0 Same Day</option>
                    <option value="T+1 Next Business Day (Standard)">
                      T+1 Next Business Day (Standard)
                    </option>
                    <option value="T+2 Business Days">T+2 Business Days</option>
                    <option value="Weekly Batch">Weekly Batch</option>
                  </select>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Settlement cycle for merchant transactions
                  </p>
                </div>

                {/* 4. Merchant Approval SLA */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Merchant Approval SLA</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    name="onboardingSla"
                    value={settings.onboardingSla}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="12 Hours (Fast Track)">12 Hours (Fast Track)</option>
                    <option value="24 Hours (Standard)">24 Hours (Standard)</option>
                    <option value="48 Hours">48 Hours</option>
                    <option value="3-5 Business Days">3-5 Business Days</option>
                  </select>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Target time to approve merchant applications
                  </p>
                </div>

                {/* 5. Auto-Verification Daily Volume Threshold (BDT) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-600 shrink-0" />
                    <span>Auto-Verification Daily Volume Threshold (BDT)</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="autoApprovalLimit"
                      value={settings.autoApprovalLimit}
                      onChange={handleChange}
                      className="w-full pr-12 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400">
                      BDT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Maximum daily transaction volume for auto-verification
                  </p>
                </div>

                {/* 6. Escalation Notification Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-emerald-600 shrink-0" />
                    <span>Escalation Notification Email</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    name="escalationEmail"
                    value={settings.escalationEmail}
                    onChange={handleChange}
                    placeholder="escalations@bank.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Email for SLA escalation notifications
                  </p>
                </div>

                {/* 7. Acquirer Webhook URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Link2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Acquirer Webhook URL</span>
                  </label>
                  <input
                    type="url"
                    name="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={handleChange}
                    placeholder="https://api.bank.com/v1/banglaqr/webhook"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Webhook URL for payment notifications from bank
                  </p>
                </div>

                {/* 8. Core Banking API Endpoint */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Settings size={14} className="text-emerald-600 shrink-0" />
                    <span>Core Banking API Endpoint</span>
                  </label>
                  <input
                    type="url"
                    name="apiBaseUrl"
                    value={settings.apiBaseUrl}
                    onChange={handleChange}
                    placeholder="https://gateway.bank.com/api"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Core banking API endpoint for integration
                  </p>
                </div>

                {/* 9. Internal Compliance & Integration Notes (full width) */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-600 shrink-0" />
                    <span>Internal Compliance & Integration Notes</span>
                  </label>
                  <textarea
                    rows={3}
                    name="complianceNotes"
                    value={settings.complianceNotes}
                    onChange={handleChange}
                    placeholder="Internal operational notes regarding this bank's settlement procedures or contact persons..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Internal notes for compliance, integration details, or special instructions (not visible to merchants)
                  </p>
                </div>
              </div>

              {/* Action Buttons: Reset & Save */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs active:scale-95"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Bank Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Information Cards (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Institution Profile */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {currentBank.logo_url ? (
                    <img
                      src={resolveImageUrl(currentBank.logo_url)}
                      alt={currentBank.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Landmark size={24} className="text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {currentBank.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      {currentBank.partnership_status === "active_partner"
                        ? "Active Partner"
                        : currentBank.status === "active"
                        ? "Active Partner"
                        : "Registered"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentBank.code || currentBank.institution_code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 dark:text-slate-500">Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatBankType(currentBank.type, currentBank.bank_category)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 dark:text-slate-500">SWIFT Code</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {currentBank.swift_code || (currentBank.code ? `${currentBank.code}BDDH` : "EBLIBDDH")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 dark:text-slate-500">Website</span>
                  {currentBank.website_url ? (
                    <a
                      href={
                        currentBank.website_url.startsWith("http")
                          ? currentBank.website_url
                          : `https://${currentBank.website_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 truncate max-w-[170px]"
                    >
                      <span className="truncate">
                        {currentBank.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 dark:text-slate-500 shrink-0">Head Office</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-right">
                    {currentBank.head_office_address || currentBank.head_office_district || "Dhaka, Bangladesh"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Verification & Risk Settings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Verification & Risk Settings
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {/* Toggle 1: Automated NID & Trade License Pre-Validation */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <FileCheck size={15} className="text-emerald-600 shrink-0" />
                      <span>Enable Automated NID & Trade License Pre-Validation</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Allow BanglaQR engine to pre-verify merchant identity before forwarding to bank officer
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.enableAutoVerification}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        enableAutoVerification: !prev.enableAutoVerification,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      settings.enableAutoVerification ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.enableAutoVerification ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: In-Person Physical Verification */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <Building2 size={15} className="text-emerald-600 shrink-0" />
                      <span>Require In-Person Physical Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Mandate physical business premises inspection by bank representative before activation
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.requirePhysicalVisit}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        requirePhysicalVisit: !prev.requirePhysicalVisit,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      settings.requirePhysicalVisit ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.requirePhysicalVisit ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Important Note */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-start gap-3">
              <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">Important Note</h5>
                <p className="text-xs text-blue-700/90 dark:text-blue-300/80 mt-0.5 leading-relaxed">
                  Changes to these settings will affect new merchant applications and related workflows for this
                  bank only.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Landmark size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold">Select an institution above to configure operational settings</p>
        </div>
      )}
    </div>
  );
}
