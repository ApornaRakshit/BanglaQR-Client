import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  FileCheck,
  CreditCard,
  Layers,
  Sparkles,
  Receipt,
  LifeBuoy,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  Globe,
  PanelTop,
  Image as ImageIcon,
  DollarSign,
  HelpCircle,
  TrendingUp,
  ListOrdered,
  MonitorCheck,
  Briefcase,
  Package,
  MessageSquare,
  MessageSquareQuote,
  Send,
  Footprints,
  PhoneCall,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export const CMS_SECTIONS = [
  { id: "navbar", label: "Navbar", labelBn: "হেডার ও নেভিগেশন", icon: PanelTop },
  { id: "hero", label: "Hero", labelBn: "ব্যানার ও হিরো সেকশন", icon: ImageIcon },
  { id: "partners", label: "Payment Partners", labelBn: "পেমেন্ট পার্টনারস", icon: CreditCard },
  { id: "whyBanglaQr", label: "Why BanglaQR", labelBn: "কেন বাংলা কিউআর", icon: HelpCircle },
  { id: "businessGrowth", label: "Business Growth", labelBn: "ব্যবসায় প্রবৃদ্ধি", icon: TrendingUp },
  { id: "howItWorks", label: "How It Works", labelBn: "কাজের ধাপসমূহ", icon: ListOrdered },
  { id: "dashboardShowcase", label: "Dashboard Showcase", labelBn: "ড্যাশবোর্ড প্রিভিউ", icon: MonitorCheck },
  { id: "businessSolutions", label: "Business Solutions", labelBn: "ব্যবসায়িক সমাধান", icon: Briefcase },
  { id: "packages", label: "Packages", labelBn: "প্যাকেজ ও প্রাইসিং", icon: Package },
  { id: "testimonials", label: "Testimonials", labelBn: "গ্রাহক মতামত", icon: MessageSquareQuote },
  { id: "finalCta", label: "Final CTA", labelBn: "রেজিস্ট্রেশন CTA", icon: Send },
  { id: "contact", label: "Contact Us", labelBn: "যোগাযোগ ও ডেমো", icon: PhoneCall },
  { id: "footer", label: "Footer", labelBn: "ফুটার ও কপিরাইট", icon: Footprints },
];

const adminNavGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        activeMatch: (pathname) => pathname === "/admin/dashboard" || pathname === "/admin",
      },
    ],
  },
  {
    title: "MERCHANT MANAGEMENT",
    items: [
      {
        label: "All Merchants",
        path: "/admin/merchants",
        icon: Users,
      },
      {
        label: "Pending Review",
        path: "/admin/merchants/pending",
        icon: Clock,
      },
      {
        label: "Under Review",
        path: "/admin/merchants/under-review",
        icon: Search,
      },
      {
        label: "Approved",
        path: "/admin/merchants/approved",
        icon: CheckCircle,
      },
      {
        label: "Rejected",
        path: "/admin/merchants/rejected",
        icon: XCircle,
      },
      {
        label: "Suspended",
        path: "/admin/merchants/suspended",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "KYC & APPLICATIONS",
    items: [
      {
        label: "KYC Review",
        path: "/admin/kyc",
        icon: UserCheck,
      },
      {
        label: "Document Review",
        path: "/admin/documents",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "PAYMENT SERVICES",
    items: [
      {
        label: "Gateway Management",
        path: "/admin/gateways",
        icon: CreditCard,
      },
      {
        label: "Gateway Applications",
        path: "/admin/gateways/applications",
        icon: Layers,
      },
      {
        label: "Gateway Services",
        path: "/admin/gateways/services",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "BUSINESS OPERATIONS",
    items: [
      {
        label: "Add-ons",
        path: "/admin/addons",
        icon: Sparkles,
      },
      {
        label: "Invoices",
        path: "/admin/invoices",
        icon: Receipt,
      },
    ],
  },
  {
    title: "WEBSITE",
    isCmsGroup: true,
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        label: "Contact Inquiries",
        path: "/admin/contact-inquiries",
        icon: MessageSquare,
      },
      {
        label: "Support",
        path: "/admin/support",
        icon: LifeBuoy,
      },
      {
        label: "Notifications",
        path: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Audit Logs",
        path: "/admin/audit",
        icon: ShieldCheck,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminSidebar({ onNavigate }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") || "navbar";
  const isCmsRoute = currentPath.startsWith("/admin/cms");

  const [cmsExpanded, setCmsExpanded] = useState(isCmsRoute);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isCmsRoute) {
      setCmsExpanded(true);
    }
  }, [isCmsRoute]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0b1320] text-slate-200">
      {/* Brand Header */}
      <div className="flex h-[66px] shrink-0 items-center border-b border-slate-800/80 px-4 bg-[#0b1320]">
        <Link to="/" className="flex items-center gap-3 w-full" onClick={onNavigate} title="BanglaQR Home">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00875a] text-white font-black text-lg shadow-sm">
            B
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold tracking-tight text-white leading-tight">BanglaQR</h1>
            <p className="text-[11px] font-medium text-slate-400">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-3 space-y-3.5 custom-scrollbar text-[12px]">
        {adminNavGroups.map((group) => {
          if (group.isCmsGroup) {
            return (
              <div key={group.title} className="space-y-1">
                <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400/70">
                  {group.title}
                </p>

                {/* Collapsible CMS Trigger */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCmsExpanded((prev) => !prev)}
                    className={`group flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150 ${
                      isCmsRoute
                        ? "bg-[#00875a] text-white font-bold shadow-xs"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe
                        size={16}
                        strokeWidth={isCmsRoute ? 2.2 : 1.8}
                        className={isCmsRoute ? "text-white shrink-0" : "text-slate-400 group-hover:text-slate-200 shrink-0"}
                      />
                      <span className="truncate">CMS</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {cmsExpanded ? (
                        <ChevronUp size={14} className={isCmsRoute ? "text-white" : "text-slate-400"} />
                      ) : (
                        <ChevronDown size={14} className={isCmsRoute ? "text-white" : "text-slate-400"} />
                      )}
                    </div>
                  </button>

                  {/* 12 Subitems */}
                  {cmsExpanded && (
                    <div className="mt-1 ml-2 pl-2 space-y-0.5 border-l border-slate-800">
                      {CMS_SECTIONS.map((sec) => {
                        const isSectionActive = isCmsRoute && activeSection === sec.id;

                        return (
                          <Link
                            key={sec.id}
                            to={`/admin/cms?section=${sec.id}`}
                            onClick={onNavigate}
                            className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors duration-150 ${
                              isSectionActive
                                ? "bg-[#00875a] text-white font-bold shadow-xs"
                                : "text-slate-400 hover:bg-slate-900/90 hover:text-slate-100"
                            }`}
                          >
                            <span className={`text-[10px] ${isSectionActive ? "text-white" : "text-slate-600 group-hover:text-slate-400"}`}>
                              {isSectionActive ? "▶" : "▷"}
                            </span>
                            <span className="truncate">{sec.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={group.title}>
              <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400/70">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.activeMatch
                    ? item.activeMatch(currentPath)
                    : currentPath === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={onNavigate}
                      className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150 ${
                        isActive
                          ? "bg-[#00875a] text-white font-bold shadow-xs"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className={isActive ? "text-white shrink-0" : "text-slate-400 group-hover:text-slate-200 shrink-0"}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="shrink-0 border-t border-slate-800/80 p-2.5 bg-[#080e18] space-y-1">
        <Link
          to="/admin/profile"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-900 transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white overflow-hidden border border-slate-600">
              {user?.email?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.name || "Admin User"}</p>
              <p className="truncate text-[10px] text-slate-400">
                {user?.role ? user.role.replace("_", " ").toUpperCase() : "Super Admin"}
              </p>
            </div>
          </div>
          <ChevronUp size={14} className="text-slate-500 shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => {
            logout();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-900 hover:text-red-400 transition"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
