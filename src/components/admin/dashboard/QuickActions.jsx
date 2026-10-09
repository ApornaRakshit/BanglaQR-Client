import { Link } from "react-router";
import {
  UserCheck,
  Shield,
  FileCheck,
  Users,
  ShieldCheck,
  ArrowRight,
  Download,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Review Pending Merchants",
      path: "/admin/merchants/pending",
      icon: Download,
      highlight: true,
    },
    {
      title: "KYC Review",
      path: "/admin/kyc",
      icon: Shield,
    },
    {
      title: "Document Review",
      path: "/admin/documents",
      icon: FileCheck,
    },
    {
      title: "View All Merchants",
      path: "/admin/merchants",
      icon: Users,
    },
    {
      title: "Audit Logs",
      path: "/admin/audit",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="h-[260px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 leading-tight">Quick Actions</h3>
      </div>

      <div className="space-y-1.5 mt-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              to={act.path}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                act.highlight
                  ? "bg-emerald-50 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70"
                  : "border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  size={14}
                  className={act.highlight ? "text-[#00875a] shrink-0" : "text-slate-500 shrink-0"}
                />
                <span className="truncate">{act.title}</span>
              </div>
              <ArrowRight size={13} className="text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
