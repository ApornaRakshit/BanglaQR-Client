import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Landmark,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Network,
  FileCheck,
  Sliders,
  RefreshCw,
  Building,
  Check,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Sparkles,
  BookOpen,
  UserPlus,
  Smartphone,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";
import BankFormModal from "./BankFormModal";

export default function BankManagement({ category = "all" }) {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalBanks: 0,
    registeredBanks: 0,
    activeBanks: 0,
    draftBanks: 0,
    totalMfs: 0,
    registeredMfs: 0,
    activeMfs: 0,
    draftMfs: 0,
    activeInstitutions: 0,
    draftInstitutions: 0,
    inactiveInstitutions: 0,
    totalCatalogue: 0,
    totalUsers: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("registered");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals & Menus
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Delete Safeguard Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const menuRef = useRef(null);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.getInstitutions({
          search: search.trim() || undefined,
          category: category !== "all" ? category : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          tab: activeTab,
        }),
        adminApi.getInstitutionStats().catch(() => null),
      ]);

      const items = listRes?.data || listRes?.institutions || listRes || [];
      setInstitutions(Array.isArray(items) ? items : []);

      const rawStats = statsRes?.data?.stats || statsRes?.stats || statsRes?.data;
      if (rawStats) {
        setStats(rawStats);
      } else {
        setStats({
          totalInstitutions: items.length,
          totalBanks: items.filter((b) => ["commercial_bank", "specialized_bank", "digital_bank", "bank"].includes(b.institution_type || b.type)).length,
          registeredBanks: items.filter((b) => ["commercial_bank", "specialized_bank", "digital_bank", "bank"].includes(b.institution_type || b.type) && (b.partnership_status !== 'none' || b.status === 'active')).length,
          activeBanks: items.filter((b) => ["commercial_bank", "specialized_bank", "digital_bank", "bank"].includes(b.institution_type || b.type) && b.status === "active").length,
          draftBanks: 0,
          totalMfs: items.filter((b) => (b.institution_type || b.type) === "mfs").length,
          registeredMfs: items.filter((b) => (b.institution_type || b.type) === "mfs" && (b.partnership_status !== 'none' || b.status === 'active')).length,
          activeMfs: items.filter((b) => (b.institution_type || b.type) === "mfs" && b.status === "active").length,
          draftMfs: 0,
          activeInstitutions: items.filter((b) => b.status === "active").length,
          draftInstitutions: items.filter((b) => b.status === "draft").length,
          inactiveInstitutions: items.filter((b) => b.status === "inactive" || b.status === "suspended").length,
          totalCatalogue: 62,
          totalUsers: 0,
          totalApplications: 0,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load institutions.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch for search and immediate filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, activeTab, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleStatusChange = async (bankId, newStatus) => {
    try {
      await adminApi.updateInstitutionStatus(bankId, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      setActiveMenuId(null);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update institution status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await adminApi.deleteInstitution(deleteTarget.id);
      showToast(res?.message || `Bank "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setDeleteError("");
      fetchData();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Cannot permanently delete institution due to associated dependent records.";
      setDeleteError(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeactivateTarget = async (status = "inactive") => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.updateInstitutionStatus(deleteTarget.id, { status });
      showToast(`Institution "${deleteTarget.name}" has been ${status === "suspended" ? "suspended" : "deactivated"} safely.`);
      setDeleteTarget(null);
      setDeleteError("");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update institution status.");
    } finally {
      setDeleting(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "islamic_bank":
        return { label: "Islamic Bank", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" };
      case "digital_bank":
        return { label: "Digital Bank", class: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300" };
      case "specialized_bank":
        return { label: "Specialized Bank", class: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" };
      case "mfs":
        return { label: "MFS", class: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" };
      case "psp":
        return { label: "PSP", class: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300" };
      case "commercial_bank":
      default:
        return { label: "Commercial Bank", class: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return { label: "Active", dot: "bg-emerald-500", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" };
      case "draft":
        return { label: "Draft", dot: "bg-amber-500", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" };
      case "suspended":
        return { label: "Suspended", dot: "bg-red-500", class: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800" };
      case "inactive":
      default:
        return { label: "Inactive", dot: "bg-slate-400", class: "bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
    }
  };

  const getPartnershipBadge = (status) => {
    switch (status) {
      case "active_partner":
        return {
          label: "Active Partner",
          class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
        };
      case "mou_signed":
        return {
          label: "MOU Signed",
          class: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
        };
      case "in_discussion":
        return {
          label: "In Discussion",
          class: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
        };
      case "partner_suspended":
        return {
          label: "Suspended",
          class: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
        };
      case "none":
      default:
        return {
          label: "Unpartnered",
          class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        };
    }
  };

  const getDirectoryBadge = (status) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified Directory",
          class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "listed":
        return {
          label: "Listed Official",
          class: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "archived":
        return {
          label: "Archived",
          class: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      case "unlisted":
      default:
        return {
          label: "Unlisted",
          class: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const getCategoryDisplay = (cat, own) => {
    const catMap = {
      commercial_conventional: "Conventional",
      commercial_islamic: "Islamic",
      specialized: "Specialized",
      foreign_commercial: "Foreign Bank",
      digital_bank: "Digital Bank",
    };
    const ownMap = {
      state_owned: "Govt / SOCB",
      private: "Private PCB",
      foreign: "Foreign FCB",
      joint_venture: "Joint Venture",
    };
    const c = catMap[cat] || cat || "Commercial";
    const o = ownMap[own] || own || "";
    return o ? `${c} (${o})` : c;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              {category === "banks" ? (
                <Landmark size={24} />
              ) : category === "mfs" ? (
                <Smartphone size={24} />
              ) : (
                <Layers size={24} />
              )}
            </div>
            {category === "banks"
              ? "Banks Management"
              : category === "mfs"
              ? "MFS Providers Management"
              : "Institution Management"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {category === "banks"
              ? "Manage Bangladesh Bank scheduled commercial, specialized, and digital banks"
              : category === "mfs"
              ? "Manage Bangladesh Bank licensed Mobile Financial Services (bKash, Nagad, Rocket, Upay)"
              : "Manage Bangladesh Bank master catalogue, Banks, MFS Providers, and acquiring partners"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditingBank(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>
              {category === "banks"
                ? "Add / Register Bank"
                : category === "mfs"
                ? "Add / Register MFS"
                : "Add / Register Institution"}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {category === "mfs" ? (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">MFS Providers</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stats.totalMfs || 4}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">BB licensed providers</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Partners</p>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.activeMfs ?? 3}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Live MFS integrations</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Network size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Connected Services</p>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  4 Direct
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">bKash, Nagad, Rocket, Upay</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Building size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Parent Banks</p>
                <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                  BRAC, DBBL, UCB
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Sponsor banks</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 col-span-2 md:col-span-1">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Staff Accounts</p>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {stats.totalUsers || 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">MFS operations</p>
              </div>
            </div>
          </>
        ) : category === "banks" ? (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Registered Banks</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stats.registeredBanks ?? 6}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">BanglaQR partners</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Partners</p>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.activeBanks ?? 6}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Live & operational</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Setup</p>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {stats.draftBanks ?? 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Under onboarding</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Building size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Bank Catalogue</p>
                <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                  {stats.totalBanks || 57}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">BB scheduled banks</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 col-span-2 md:col-span-1">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Bank Users</p>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {stats.totalUsers || 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Staff accounts</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">All Registered</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stats.totalInstitutions || 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Banks & MFS</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Banks</p>
                <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                  {stats.totalBanks || 57}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">BB scheduled</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">MFS Providers</p>
                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  {stats.totalMfs || 4}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">BB licensed</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Partners</p>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.activeInstitutions || 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Live on platform</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 col-span-2 md:col-span-1">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Staff Accounts</p>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {stats.totalUsers || 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Total users</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sub-view Filter Tabs (Registered vs Catalogue) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 w-fit flex-wrap border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setActiveTab("registered")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === "registered"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Landmark size={14} />
          <span>
            {category === "banks"
              ? "Registered Banks"
              : category === "mfs"
              ? "Registered MFS Providers"
              : "Registered Institutions"}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "registered"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {category === "mfs"
              ? (stats.registeredMfs ?? 3)
              : category === "banks"
              ? (stats.registeredBanks ?? 6)
              : (stats.totalInstitutions ?? 10)}
          </span>
        </button>

        {category !== "mfs" && (
          <button
            type="button"
            onClick={() => setActiveTab("catalogue")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === "catalogue"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen size={14} />
            <span>Full Bank Catalogue</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "catalogue"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {stats.totalBanks || 57}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === "active"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Active Partners</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "active"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {category === "banks"
              ? (stats.activeBanks ?? 6)
              : category === "mfs"
              ? (stats.activeMfs ?? 3)
              : (stats.activeInstitutions ?? 9)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === "pending"
              ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock size={14} />
          <span>Pending Setup</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "pending"
                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {category === "banks"
              ? (stats.draftBanks ?? 0)
              : category === "mfs"
              ? (stats.draftMfs ?? 0)
              : (stats.draftInstitutions ?? 0)}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={category === "mfs" ? "Search by MFS name (bKash, Nagad, Rocket, Upay), code or email..." : "Search by name, code (BRAC, SONALI), SWIFT code, or email..."}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Clear search"
            >
              <XCircle size={14} />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              {category !== "mfs" && (
                <>
                  <option value="commercial_bank">Commercial Bank</option>
                  <option value="specialized_bank">Specialized Bank</option>
                  <option value="digital_bank">Digital Bank</option>
                </>
              )}
              {category !== "banks" && (
                <>
                  <option value="mfs">MFS Provider</option>
                  <option value="payment_gateway">Payment Gateway</option>
                </>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchData}
            title="Refresh table"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">{category === "mfs" ? "MFS Provider" : category === "banks" ? "Bank" : "Institution"}</th>
                <th className="py-3.5 px-3">{category === "mfs" ? "Brand & Operator" : "Category & Model"}</th>
                <th className="py-3.5 px-3">Linked Services</th>
                <th className="py-3.5 px-3">Staff Users</th>
                <th className="py-3.5 px-3">Partnership</th>
                <th className="py-3.5 px-3">Status & Verification</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs">Loading banking institutions...</p>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No banking institutions found
                    </p>
                    <p className="text-xs mt-1">Try switching tabs or adjusting search filters.</p>
                  </td>
                </tr>
              ) : (
                institutions.map((bank) => {
                  const bankCode = bank.code || bank.institution_code || "BNK";
                  const bankType = bank.type || bank.institution_type || "commercial_bank";
                  const typeBadge = getTypeBadge(bankType);
                  const statusBadge = getStatusBadge(bank.status);
                  const partnershipBadge = getPartnershipBadge(bank.partnership_status);
                  const isMenuOpen = activeMenuId === bank.id;
                  const servicesList = bank.services || [];
                  const userCount = Number(bank.users_count || bank.usersCount || bank.staff_count || 0);
                  const isUnregistered =
                    (!bank.partnership_status || bank.partnership_status === "none") && bank.status !== "active";

                  return (
                    <tr
                      key={bank.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Bank / Institution */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                            {bank.logo_url ? (
                              <img
                                src={resolveImageUrl(bank.logo_url)}
                                alt={bank.name}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {bankCode.slice(0, 3)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                to={`/admin/institutions/${bank.id}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                              >
                                {bank.mfs_brand_name || bank.name}
                              </Link>
                              <span className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {bank.mfs_provider_code || bankCode}
                              </span>
                            </div>
                            {bank.name_bn && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {bank.name_bn}
                              </p>
                            )}
                            {bankType === "mfs" ? (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <span>Parent:</span>
                                {bank.parent_bank_name ? (
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {bank.parent_bank_name}
                                  </span>
                                ) : (
                                  <span className="italic text-slate-400">Independent / Direct License</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                                {bank.swift_code ? (
                                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <ShieldCheck size={11} /> SWIFT: {bank.swift_code}
                                  </span>
                                ) : (
                                  <span className="font-mono text-slate-400">SWIFT: —</span>
                                )}
                                {bank.website_url && (
                                  <a
                                    href={bank.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                                  >
                                    <span>Website</span>
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Model / Brand & Operator */}
                      <td className="py-3.5 px-3">
                        {bankType === "mfs" ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              MFS Provider
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[180px]">
                              {bank.mfs_legal_operator_name || bank.legal_name || bank.name}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeBadge.class}`}
                            >
                              {getCategoryDisplay(bank.bank_category, bank.ownership_type)}
                            </span>
                            {bank.banking_model && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                                Model: {bank.banking_model}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Linked Services */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {servicesList.length > 0 ? (
                            servicesList.map((svc) => (
                              <span
                                key={svc.id}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {svc.name}
                              </span>
                            ))
                          ) : (
                            <Link
                              to={`/admin/institutions/services?institutionId=${bank.id}`}
                              className="text-[11px] text-slate-400 hover:text-emerald-600 transition"
                            >
                              + Link Service
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Staff Users */}
                      <td className="py-3.5 px-3">
                        <Link
                          to={`/admin/institutions/users?institutionId=${bank.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                        >
                          <Users size={12} />
                          <span>{userCount} Staff</span>
                        </Link>
                      </td>

                      {/* Partnership */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${partnershipBadge.class}`}
                        >
                          {partnershipBadge.label}
                        </span>
                      </td>

                      {/* Status & Verification */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.class}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${getDirectoryBadge(bank.directory_status).class}`}
                          >
                            {getDirectoryBadge(bank.directory_status).label}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Register Button for Catalogue Banks */}
                          {isUnregistered && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBank(bank);
                                setIsFormModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
                            >
                              <Plus size={12} />
                              <span>Register</span>
                            </button>
                          )}

                          <div className="inline-block text-left" ref={isMenuOpen ? menuRef : null}>
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(isMenuOpen ? null : bank.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-4 mt-1 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-30 py-1.5 text-xs animate-in fade-in slide-in-from-top-1 text-left">
                                {isUnregistered && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setEditingBank(bank);
                                      setIsFormModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2 px-3.5 py-2 font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  >
                                    <Sparkles size={13} />
                                    <span>Register Bank</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/${bank.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <Landmark size={13} className="text-emerald-600" />
                                  <span>View Bank Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditingBank(bank);
                                    setIsFormModalOpen(true);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <Edit2 size={13} className="text-blue-500" />
                                  <span>Edit Bank Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/services?institutionId=${bank.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <Network size={13} className="text-emerald-500" />
                                  <span>Manage Services</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/users?institutionId=${bank.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <Users size={13} className="text-indigo-500" />
                                  <span>Manage Bank Users</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/${bank.id}?tab=users&invite=true`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                                >
                                  <UserPlus size={13} className="text-indigo-600 dark:text-indigo-400" />
                                  <span>Invite Bank Admin</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/kyc-requirements?institutionId=${bank.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <FileCheck size={13} className="text-amber-500" />
                                  <span>KYC Requirements</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/admin/institutions/settings?institutionId=${bank.id}`);
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                >
                                  <Sliders size={13} className="text-purple-500" />
                                  <span>Bank Settings</span>
                                </button>

                                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                                {bank.status !== "active" && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(bank.id, "active")}
                                    className="flex w-full items-center gap-2 px-3.5 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                  >
                                    <Check size={13} />
                                    <span>Activate Bank</span>
                                  </button>
                                )}

                                {bank.status === "active" && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(bank.id, "inactive")}
                                    className="flex w-full items-center gap-2 px-3.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                                  >
                                    <XCircle size={13} />
                                    <span>Deactivate</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeleteTarget(bank);
                                    setDeleteError("");
                                  }}
                                  className="flex w-full items-center gap-2 px-3.5 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete Bank</span>
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* Bank Form Modal (Unified Dropdown Registration & Edit) */}
      <BankFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBank(null);
        }}
        bank={editingBank}
        initialCategory={category}
        onSuccess={(msg) => {
          showToast(msg);
          fetchData();
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (() => {
        const staffCount = Number(deleteTarget.staff_count || 0);
        const serviceCount = Number(deleteTarget.service_count || 0);
        const appsCount = Number(deleteTarget.linked_application_count || 0);
        const branchesCount = Number(deleteTarget.branches_count || 0);
        const hasDependencies = staffCount > 0 || serviceCount > 0 || appsCount > 0 || branchesCount > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {hasDependencies ? "Deletion Blocked by System Safeguards" : "Delete Institution Permanently"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Database safeguard check & audit integrity</p>
                </div>
              </div>

              {hasDependencies ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1.5 mb-2 text-amber-800 dark:text-amber-300">
                      <AlertCircle size={15} />
                      Cannot permanently delete "{deleteTarget.name}"
                    </p>
                    <p className="mb-2">
                      This institution is linked to active operational and financial records. Deleting it would break historical audit trails and transaction mappings.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 font-medium">
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-800/40">
                        👥 Staff Members: <strong className="text-slate-900 dark:text-white">{staffCount}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-800/40">
                        ⚡ Active Services: <strong className="text-slate-900 dark:text-white">{serviceCount}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-800/40">
                        📋 Merchant Apps: <strong className="text-slate-900 dark:text-white">{appsCount}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-800/40">
                        🏢 Branches: <strong className="text-slate-900 dark:text-white">{branchesCount}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Recommended Action:</strong> Deactivate or Suspend the institution instead. This immediately disables onboarding and new logins while safely preserving historical merchant transactions and reporting data.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-slate-900 dark:text-white">"{deleteTarget.name}"</strong>?
                  This institution has no linked staff, gateways, or merchant records. This operation cannot be undone.
                </p>
              )}

              {deleteError && (
                <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteError("");
                  }}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {hasDependencies || deleteError ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivateTarget("inactive")}
                      disabled={deleting}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 transition shadow-xs disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      <span>{deleting ? "Updating..." : "Deactivate Institution Instead"}</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || hasDependencies}
                    title={hasDependencies ? "Permanent deletion blocked due to linked dependencies" : "Confirm Delete"}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={13} />
                        <span>{hasDependencies ? "Delete Blocked" : "Confirm Delete"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
