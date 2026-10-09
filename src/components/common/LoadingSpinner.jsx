import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = 24, text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
      <Loader2 size={size} className="animate-spin text-emerald-600 mb-2" />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
}

