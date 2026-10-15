import { useEffect, useRef, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";

import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
  CheckCheck,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { merchantApi } from "../services/merchantApi";
import logoImg from "../assets/logo.jpg";

/* =========================================================
   MERCHANT SIDEBAR MENU
========================================================= */

const menuGroups = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/merchant/dashboard",
        icon: LayoutDashboard,
        matchPrefixes: ["/merchant/dashboard"],
      },
    ],
  },

  {
    title: "Business",
    items: [
      {
        label: "Company Profile",
        path: "/merchant/onboarding/company",
        icon: Building2,
        matchPrefixes: [
          "/merchant/company",
          "/merchant/kyc",
          "/merchant/onboarding",
        ],
      },
    ],
  },

  {
    title: "Payment Services",
    items: [
      {
        label: "Gateway Services",
        path: "/merchant/gateways",
        icon: CreditCard,
        matchPrefixes: ["/merchant/gateways"],
      },
      {
        label: "My Services",
        path: "/merchant/services",
        icon: Package,
        matchPrefixes: ["/merchant/services"],
      },
      {
        label: "Applications",
        path: "/merchant/applications",
        icon: ClipboardList,
        matchPrefixes: ["/merchant/applications"],
      },
      {
        label: "Add-ons",
        path: "/merchant/addons",
        icon: ShieldCheck,
        matchPrefixes: ["/merchant/addons"],
      },
      {
        label: "My Orders",
        path: "/merchant/orders",
        icon: ShoppingBag,
        matchPrefixes: ["/merchant/orders", "/merchant/my-orders"],
      },
      {
        label: "My Payments",
        path: "/merchant/payments",
        icon: CreditCard,
        matchPrefixes: ["/merchant/payments", "/merchant/my-payments"],
      },
    ],
  },

  {
    title: "Communication",
    items: [
      {
        label: "Support",
        path: "/merchant/support",
        icon: LifeBuoy,
        matchPrefixes: ["/merchant/support"],
      },
      {
        label: "Notifications",
        path: "/merchant/notifications",
        icon: Bell,
        matchPrefixes: ["/merchant/notifications"],
      },
    ],
  },

  {
    title: "Account",
    items: [
      {
        label: "Settings",
        path: "/merchant/settings",
        icon: Settings,
        matchPrefixes: ["/merchant/settings"],
      },
    ],
  },
];

/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

function SidebarNavigation({ onNavigate, isApproved = false }) {
  const location = useLocation();
  const currentPath = location.pathname;

  function isItemActive(item) {
    if (item.matchPrefixes && item.matchPrefixes.length > 0) {
      return item.matchPrefixes.some((prefix) =>
        prefix === "/merchant/dashboard"
          ? currentPath === prefix
          : currentPath === prefix || currentPath.startsWith(prefix + "/")
      );
    }
    return currentPath === item.path || currentPath.startsWith(item.path + "/");
  }

  // If merchant is not yet approved, only show Overview, Business (onboarding), and Account (settings)
  const visibleMenuGroups = isApproved
    ? menuGroups
    : menuGroups.filter((g) => ["Overview", "Business", "Account"].includes(g.title));

  return (
    <nav className="px-3 py-4">
      <div className="space-y-5 pb-4">
        {visibleMenuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800"
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={isActive ? 2.2 : 1.9}
                      />
                    </div>

                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/* =========================================================
   DESKTOP SIDEBAR
   - NO EMAIL
   - NO LOGOUT
========================================================= */

function SidebarContent({ isApproved }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Logo */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-slate-200 px-5">
        <Link to="/" className="flex items-center group transition" title="BanglaQR - Visit Public Homepage">
          <img
            src={logoImg}
            alt="BanglaQR"
            className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Scrollable menu */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <SidebarNavigation isApproved={isApproved} />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN MERCHANT LAYOUT
========================================================= */

export default function MerchantLayout() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  /* Mobile drawer */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Profile dropdown */
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  /* Notification dropdown & count */
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifMenuRef = useRef(null);

  /* Close menus when clicking outside */
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target)
      ) {
        setNotifMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* Fetch unread notifications count */
  const fetchUnreadCount = async () => {
    try {
      const res = await merchantApi.getUnreadNotificationCount();
      if (res.success || typeof res.unreadCount === "number" || typeof res.count === "number") {
        setUnreadNotifCount(Number(res.unreadCount ?? res.count ?? res.data?.unreadCount ?? 0));
      }
    } catch {
      // non-blocking
    }
  };

  /* Fetch notifications for dropdown */
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await merchantApi.getNotifications();
      const list = res.notifications || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setNotifications(safeList);
      const unread = safeList.filter((n) => !n.is_read && !n.isRead).length;
      setUnreadNotifCount(unread);
    } catch {
      // non-blocking
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotifs = () => {
    setProfileMenuOpen(false);
    if (!notifMenuOpen) {
      fetchNotifications();
    }
    setNotifMenuOpen((prev) => !prev);
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await merchantApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await merchantApi.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: 1, isRead: true }))
      );
      setUnreadNotifCount(0);
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read && !notif.isRead) {
      handleMarkRead(notif.id);
    }
    setNotifMenuOpen(false);
    if (notif.link) {
      navigate(notif.link);
    } else {
      navigate("/merchant/notifications");
    }
  };

  /* =======================================================
     PREVENT BODY SCROLL WHEN MOBILE DRAWER OPEN
  ======================================================= */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* =======================================================
     CLOSE MOBILE MENU ON ESC
  ======================================================= */

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      navigate("/login", {
        replace: true,
      });
    }
  }

  /* =======================================================
     PROFILE NAVIGATION
  ======================================================= */

  function handleProfileNavigate(path) {
    setProfileMenuOpen(false);

    navigate(path);
  }

  /* Merchant profile status check */
  const [merchantMe, setMerchantMe] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    merchantApi
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          setMerchantMe(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setStatusLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isApproved =
    !statusLoading &&
    Boolean(
      merchantMe?.isApproved ||
      merchantMe?.merchant?.accountStatus === "approved" ||
      merchantMe?.merchant?.accountStatus === "active"
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-200 bg-white lg:block">
        <SidebarContent isApproved={isApproved} />
      </aside>

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close merchant menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />

          {/* Drawer */}
          <aside
            className="
              fixed
              inset-y-0
              left-0
              z-50
              flex
              h-[100dvh]
              w-[290px]
              max-w-[88vw]
              flex-col
              overflow-hidden
              border-r
              border-slate-200
              bg-white
              shadow-2xl
              lg:hidden
            "
            aria-label="Merchant navigation"
          >
            {/* ==========================================
                MOBILE HEADER
            =========================================== */}

            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center group transition"
                title="BanglaQR - Visit Public Homepage"
              >
                <img
                  src={logoImg}
                  alt="BanglaQR"
                  className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* ==========================================
                SCROLLABLE NAVIGATION
            =========================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidebarNavigation
                isApproved={isApproved}
                onNavigate={() =>
                  setMobileMenuOpen(false)
                }
              />
            </div>

            {/* ==========================================
                MOBILE LOGOUT
                ALWAYS FIXED AT BOTTOM
            =========================================== */}

            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                z-20
                shrink-0
                border-t
                border-slate-200
                bg-white
                p-3
                pb-[max(12px,env(safe-area-inset-bottom))]
              "
            >
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-red-600
                  transition
                  hover:bg-red-100
                  hover:text-red-700
                  active:bg-red-100
                "
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* =====================================================
          MAIN APPLICATION AREA
      ====================================================== */}

      <div className="min-h-screen lg:pl-[260px]">
        {/* ===================================================
            TOP NAVBAR
        ==================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* ===============================================
                LEFT SIDE
            ================================================ */}

            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
                aria-label="Open merchant menu"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  Merchant Portal
                </p>

                <p className="hidden truncate text-sm text-slate-500 sm:block">
                  Manage your digital payment services
                </p>
              </div>
            </div>

            {/* ===============================================
                RIGHT SIDE
            ================================================ */}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Notifications with interactive dropdown */}
              <div ref={notifMenuRef} className="relative">
                <button
                  type="button"
                  onClick={handleToggleNotifs}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell size={21} />

                  {unreadNotifCount > 0 && (
                    <span className="absolute right-[8px] top-[7px] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                      {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {notifMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden text-slate-900">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                        {unreadNotifCount > 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>

                      {unreadNotifCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          <CheckCheck size={13} />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    {/* List Body */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                      {loadingNotifs ? (
                        <div className="flex h-36 flex-col items-center justify-center gap-2 text-slate-400">
                          <Loader2 size={20} className="animate-spin text-emerald-600" />
                          <span className="text-xs">Loading updates...</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Bell size={18} />
                          </div>
                          <p className="text-xs font-bold text-slate-800">No new notifications</p>
                          <p className="text-[11px] text-slate-400">You're all caught up with recent updates.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => {
                          const isUnread = !notif.is_read && !notif.isRead;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                                isUnread ? "bg-emerald-50/40" : "bg-white"
                              }`}
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 mt-0.5 border border-slate-200/60">
                                <Bell size={14} className={isUnread ? "text-emerald-600" : "text-slate-400"} />
                              </div>

                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs truncate ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                    {notif.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {(notif.created_at || notif.createdAt) ? new Date(notif.created_at || notif.createdAt).toLocaleDateString() : ""}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifMenuOpen(false);
                          navigate("/merchant/notifications");
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              {/* =================================================
                  PROFILE BUTTON
                  NO BACKGROUND
              ================================================== */}

              <div
                ref={profileMenuRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen(
                      (previous) =>
                        !previous
                    )
                  }
                  className="flex items-center gap-2 sm:gap-3"
                  aria-expanded={
                    profileMenuOpen
                  }
                  aria-haspopup="menu"
                >
                  {/* Email / Role */}
                  <div className="hidden text-right sm:block">
                    <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                      {user?.email ||
                        "Merchant"}
                    </p>

                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] capitalize text-slate-500">
                      <span>
                        {user?.role ||
                          "merchant"}
                      </span>

                      <CheckCircle2
                        size={11}
                        className="text-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 ring-4 ring-emerald-50">
                    {user?.email
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "M"}
                  </div>

                  {/* Arrow */}
                  <ChevronDown
                    size={16}
                    className={`hidden text-slate-400 transition-transform sm:block ${
                      profileMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* =================================================
                    PROFILE DROPDOWN
                ================================================== */}

                {profileMenuOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-[calc(100%+10px)]
                      z-50
                      w-[290px]
                      max-w-[calc(100vw-24px)]
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-xl
                      shadow-slate-900/10
                    "
                    role="menu"
                  >
                    {/* Profile header */}
                    <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {user?.email
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "M"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user?.email ||
                              "Merchant"}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="capitalize text-sm text-slate-500">
                              {user?.role ||
                                "merchant"}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <span className="text-sm font-medium text-emerald-600">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile actions */}
                    <div className="p-2">
                      {/* My Profile */}
                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigate(
                            "/merchant/company"
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        role="menuitem"
                      >
                        <UserRound
                          size={18}
                          className="shrink-0 text-slate-500"
                        />

                        <div className="min-w-0">
                          <p>
                            My Profile
                          </p>

                          <p className="mt-0.5 truncate text-[11px] font-normal text-slate-400">
                            View your merchant profile
                          </p>
                        </div>
                      </button>

                      {/* Account Settings */}
                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigate(
                            "/merchant/settings"
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        role="menuitem"
                      >
                        <Settings
                          size={18}
                          className="shrink-0 text-slate-500"
                        />

                        <div className="min-w-0">
                          <p>
                            Account Settings
                          </p>

                          <p className="mt-0.5 truncate text-[11px] font-normal text-slate-400">
                            Manage account preferences
                          </p>
                        </div>
                      </button>

                      {/* Security */}
                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigate(
                            "/merchant/settings?tab=security"
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        role="menuitem"
                      >
                        <ShieldCheck
                          size={18}
                          className="shrink-0 text-slate-500"
                        />

                        <div className="min-w-0">
                          <p>
                            Security
                          </p>

                          <p className="mt-0.5 truncate text-[11px] font-normal text-slate-400">
                            Password, 2FA & sessions
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        role="menuitem"
                      >
                        <LogOut
                          size={18}
                          className="shrink-0"
                        />

                        <div className="min-w-0">
                          <p>Logout</p>

                          <p className="mt-0.5 truncate text-[11px] font-normal text-red-400">
                            Sign out of your account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}