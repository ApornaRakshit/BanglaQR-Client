import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Settings,
  Search,
  Calendar,
  CheckCheck,
  Clock,
  MessageSquare,
  Users,
  FileCheck,
  Layers,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { adminApi } from "../../../services/adminApi";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "এইমাত্র";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} মি. আগে`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ঘ. আগে`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type) {
  switch (type) {
    case "contact_inquiry":
      return <MessageSquare size={14} className="text-emerald-600" />;
    case "merchant_update":
      return <Users size={14} className="text-blue-600" />;
    case "kyc":
      return <ShieldCheck size={14} className="text-indigo-600" />;
    case "document":
      return <FileCheck size={14} className="text-amber-600" />;
    case "gateway":
      return <Layers size={14} className="text-purple-600" />;
    case "security":
      return <AlertTriangle size={14} className="text-red-600" />;
    default:
      return <Bell size={14} className="text-slate-600" />;
  }
}

export default function AdminNavbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // 1. Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await adminApi.getUnreadNotificationCount();
      if (res.success) {
        setUnreadCount(Number(res.unreadCount || res.data?.unreadCount || 0));
      }
    } catch (err) {
      // Non-blocking
    }
  };

  // 2. Fetch notification dropdown list
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await adminApi.getNotifications({ limit: 8 });
      if (res.success) {
        const list = res.notifications || res.data?.notifications || res.data || [];
        setNotifications(Array.isArray(list) ? list : []);
        if (typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      // Non-blocking
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Initial load and periodic polling every 30s
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    const handleFocus = () => {
      fetchUnreadCount();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // When notification dropdown opens, fetch latest
  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  // Handle outside click
  useEffect(() => {
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate("/admin/notifications");
    }
  };

  async function handleLogout() {
    try {
      setProfileOpen(false);
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login", { replace: true });
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/merchants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const roleDisplay = user?.role
    ? user.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Super Admin";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger & Search bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchants, applications, transactions..."
              className="h-10 w-80 md:w-[420px] lg:w-[440px] rounded-xl bg-[#f1f5f9] pl-9 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] border border-transparent transition"
            />
          </form>
        </div>

        {/* Right Controls: Date Range, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Date Selector */}
          <button
            type="button"
            className="hidden sm:flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Calendar size={14} className="text-slate-500" />
            <span>This Month</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Interactive Notifications Bell & Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-xs animate-in zoom-in">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden text-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">নোটিফিকেশন (Notifications)</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {unreadCount} নতুন
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <CheckCheck size={13} />
                      <span>সব পড়া হয়েছে</span>
                    </button>
                  )}
                </div>

                {/* List Body */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {loadingNotifs ? (
                    <div className="flex h-36 flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 size={20} className="animate-spin text-emerald-600" />
                      <span className="text-xs">লোড হচ্ছে...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Bell size={18} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">কোনো নতুন নোটিফিকেশন নেই।</p>
                      <p className="text-[11px] text-slate-400">নতুন কার্যক্রমের নোটিফিকেশন এখানে প্রদর্শিত হবে।</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                          !notif.isRead ? "bg-emerald-50/40" : "bg-white"
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 mt-0.5 border border-slate-200/60">
                          {getNotificationIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs truncate ${!notif.isRead ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notif.isRead && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-emerald-600 mt-1.5"
                            title="Unread"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Link */}
                <div className="border-t border-slate-100 bg-slate-50/80 p-2.5 text-center">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition"
                  >
                    <span>সব নোটিফিকেশন দেখুন</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-50 transition"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-emerald-400 ring-1 ring-slate-200 overflow-hidden">
                {user?.email?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[10px] font-medium text-slate-400">{roleDisplay}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                <div className="border-b border-slate-100 bg-[#0b1320] p-3.5 text-white">
                  <p className="truncate text-sm font-bold text-white">{user?.email || "admin@banglaqr.com"}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase mt-0.5">{roleDisplay}</p>
                </div>

                <div className="p-1.5 space-y-0.5 text-sm">
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Settings size={15} className="text-slate-400" />
                    <span>Platform Settings</span>
                  </Link>

                  <Link
                    to="/admin/audit"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <ShieldCheck size={15} className="text-slate-400" />
                    <span>Audit Logs</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 p-1.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
