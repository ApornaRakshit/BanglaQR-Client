import { Link, useLocation } from "react-router";
import {
  Layers,
  Landmark,
  Smartphone,
  Network,
  Users,
  FileCheck,
  Sliders,
  ExternalLink,
} from "lucide-react";

export const INSTITUTION_TABS = [
  { id: "all", label: "All Institutions", path: "/admin/institutions", icon: Layers },
  { id: "banks", label: "Banks", path: "/admin/institutions/banks", icon: Landmark },
  { id: "mfs", label: "MFS Providers", path: "/admin/institutions/mfs", icon: Smartphone },
  { id: "services", label: "Institution Services", path: "/admin/institutions/services", icon: Network },
  { id: "users", label: "Institution Users", path: "/admin/institutions/users", icon: Users },
  { id: "kyc", label: "KYC Requirements", path: "/admin/institutions/kyc-requirements", icon: FileCheck },
  { id: "settings", label: "Institution Settings", path: "/admin/institutions/settings", icon: Sliders },
  { id: "portal", label: "Institution Portal", path: "/institution/dashboard", icon: ExternalLink },
];

export const BANK_TABS = INSTITUTION_TABS;

export default function BankNavTabs() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
      {BANK_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path;

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              isActive
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <Icon size={14} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

