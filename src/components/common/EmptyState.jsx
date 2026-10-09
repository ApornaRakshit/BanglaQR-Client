import { AlertCircle } from "lucide-react";

export default function EmptyState({
  title = "No records found",
  description = "There are no items to display at this time.",
  icon: Icon = AlertCircle,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={24} />
      </div>
      <h4 className="mt-3 text-sm font-bold text-slate-900">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

