import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileCheck2,
  GitBranch,
  Users2,
  ServerCog,
  PlugZap,
  BarChart3,
  LogOut,
  Landmark,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronRight,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
  Bell,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { institutionApi } from "../services/institutionApi";
import { authApi } from "../services/authApi";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    path: "/institution/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Applications",
    path: "/institution/applications",
    icon: FileCheck2,
  },
  {
    name: "KYC Review",
    path: "/institution/kyc-review",
    icon: ShieldCheck,
  },
  {
    name: "My Merchants",
    path: "/institution/merchants",
    icon: Building2,
  },
  {
    name: "Services",
    path: "/institution/services",
    icon: ServerCog,
  },
  {
    name: "Reports",
    path: "/institution/reports",
    icon: BarChart3,
  },
  {
    name: "Users & Access",
    path: "/institution/staff",
    icon: Users2,
  },
  {
    name: "Audit Logs",
    path: "/institution/connections",
    icon: PlugZap,
  },
  {
    name: "Settings",
    path: "/institution/branches",
    icon: GitBranch,
  },
];

export default function InstitutionLayout() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [institutionProfile, setInstitutionProfile] = useState(null);

  // Password Management State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Check if first-login password change is mandatory
  useEffect(() => {
    if (user?.mustChangePassword) {
      setIsPasswordModalOpen(true);
    }
  }, [user?.mustChangePassword]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwForm.currentPassword) {
      setPwError("Current password is required.");
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmNewPassword: pwForm.confirmNewPassword,
      });
      setPwSuccess(res?.message || "Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      if (typeof refreshUser === "function") {
        await refreshUser();
      }
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await institutionApi.getNotifications();
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (_) {}
  };

  useEffect(() => {
    let isMounted = true;
    institutionApi
      .getMe()
      .then((res) => {
        if (isMounted && res.data?.institution) {
          setInstitutionProfile(res.data.institution);
        }
      })
      .catch((err) => {
        console.warn("Failed to load institution profile:", err?.message);
      });

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkNotifRead = async (notifId, link) => {
    try {
      await institutionApi.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifOpen(false);
      if (link) navigate(link);
    } catch (_) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const activeMembership = Array.isArray(user?.institutionMemberships)
    ? user.institutionMemberships.find(
        (m) =>
          String(m.institutionId || m.id) ===
          String(institutionProfile?.id || user?.institutionId)
      ) || user.institutionMemberships[0]
    : null;

  const institutionName =
    institutionProfile?.name ||
    activeMembership?.institution_name ||
    user?.institution?.name ||
    "Banking Partner";
  const institutionCode =
    institutionProfile?.institution_code ||
    activeMembership?.institution_code ||
    user?.institution?.code ||
    "PARTNER";
  const userRole =
    activeMembership?.institution_role ||
    user?.institution?.role ||
    user?.role ||
    "Staff";

  const institutionLogo =
    institutionProfile?.logo_url ||
    activeMembership?.logoUrl ||
    user?.institution?.logoUrl ||
    null;

  const isAdmin = Boolean(
    user?.roles?.some((r) => ["super_admin", "admin", "reviewer"].includes(r)) ||
      ["super_admin", "admin", "reviewer"].includes(user?.role)
  );
  const isMerchant = Boolean(
    user?.isMerchant ||
      user?.roles?.includes("merchant") ||
      user?.role === "merchant"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* =====================================================
          DESKTOP SIDEBAR (240px)
      ====================================================== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-slate-800/80 bg-[#0b1320] lg:flex lg:flex-col">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Landmark size={20} />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">
                Bangla<span className="text-emerald-400">QR</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Institution Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Current Institution Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200">
          <div className="flex items-center gap-2">
            {institutionLogo ? (
              <img
                src={institutionLogo}
                alt={institutionName}
                className="w-7 h-7 rounded-lg object-contain bg-white/10 p-0.5 shrink-0 border border-slate-700"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 flex items-center justify-center shrink-0 border border-emerald-800/40">
                <Building2 size={15} className="text-emerald-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white" title={institutionName}>
                {institutionName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 font-mono text-[9px] uppercase border border-emerald-800/60">
                  {institutionCode}
                </span>
                <span className="text-[10px] text-slate-400 truncate capitalize">
                  {userRole.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Link & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-xl text-purple-400 hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>Admin Portal</span>
              </span>
              <ExternalLink size={12} />
            </Link>
          )}

          {isMerchant && (
            <Link
              to="/merchant/dashboard"
              className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-xl text-emerald-400 hover:bg-slate-800/60 transition"
            >
              <span className="flex items-center gap-2">
                <Building2 size={14} />
                <span>Merchant Portal</span>
              </span>
              <ExternalLink size={12} />
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
              setPwError("");
              setPwSuccess("");
              setIsPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
          >
            <KeyRound size={15} className="text-emerald-400" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN WRAPPER
      ====================================================== */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb info */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span>Institution Portal</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {NAV_ITEMS.find((n) => location.pathname.startsWith(n.path))?.name || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Notifications ({unreadCount} unread)
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkNotifRead(notif.id, notif.action_url || "/institution/applications")}
                          className={`p-3 text-xs cursor-pointer transition flex items-start gap-2.5 ${
                            notif.is_read ? "opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/40" : "bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          }`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${notif.is_read ? "bg-transparent" : "bg-emerald-500"}`} />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {user?.email}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">
                {userRole.replace("_", " ")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#0b1320] p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-extrabold text-white text-sm">
                Bangla<span className="text-emerald-400">QR</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition ${
                      isActive ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 rounded-xl"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update your account credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {user?.mustChangePassword && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                <AlertCircle size={15} className="shrink-0 text-amber-500" />
                <span>You were issued a temporary password. You must set a new secure password before proceeding.</span>
              </div>
            )}

            {pwError && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={15} className="shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                <Check size={15} className="shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={pwForm.confirmNewPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={pwLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

