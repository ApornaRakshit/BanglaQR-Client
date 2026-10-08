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
  Code2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
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
    ],
  },

  {
    title: "Billing & Invoicing",
    items: [
      {
        label: "Invoices",
        path: "/merchant/invoices",
        icon: ClipboardList,
        matchPrefixes: ["/merchant/invoices"],
      },
    ],
  },

  {
    title: "Integration",
    items: [
      {
        label: "API & Integration",
        path: "/merchant/integration",
        icon: Code2,
        matchPrefixes: ["/merchant/integration"],
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

function SidebarNavigation({ onNavigate }) {
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

  return (
    <nav className="px-3 py-4">
      <div className="space-y-5 pb-4">
        {menuGroups.map((group) => (
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

function SidebarContent() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* Logo */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-slate-200 px-5">
        <Link to="/merchant/dashboard" className="flex items-center">
          <img
            src={logoImg}
            alt="BanglaQR"
            className="h-11 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Scrollable menu */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <SidebarNavigation />
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
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* Profile dropdown */
  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const profileMenuRef = useRef(null);

  /* =======================================================
     CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
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
              <Link to="/merchant/dashboard" className="flex items-center">
                <img
                  src={logoImg}
                  alt="BanglaQR"
                  className="h-10 w-auto object-contain"
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

                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  Manage your digital payment services
                </p>
              </div>
            </div>

            {/* ===============================================
                RIGHT SIDE
            ================================================ */}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Notifications */}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/merchant/notifications"
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell size={21} />

                <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

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
                            <span className="capitalize text-xs text-slate-500">
                              {user?.role ||
                                "merchant"}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <span className="text-xs font-medium text-emerald-600">
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