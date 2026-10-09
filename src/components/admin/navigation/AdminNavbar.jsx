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
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminNavbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

          {/* Notifications Button */}
          <Link
            to="/admin/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
              12
            </span>
          </Link>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
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
