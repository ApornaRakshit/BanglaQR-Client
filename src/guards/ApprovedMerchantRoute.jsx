import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { merchantApi } from "../services/merchantApi";
import { Loader2 } from "lucide-react";

export default function ApprovedMerchantRoute() {
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    merchantApi
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        const merchant = res?.data?.merchant;
        const approved =
          res?.data?.isApproved ||
          merchant?.accountStatus === "approved" ||
          merchant?.accountStatus === "active";
        setIsApproved(Boolean(approved));
      })
      .catch((err) => {
        console.error("Failed to verify merchant approval status:", err);
        setIsApproved(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
        <span className="text-sm font-medium text-slate-500">Verifying access permissions...</span>
      </div>
    );
  }

  if (!isApproved) {
    return <Navigate to="/merchant/dashboard" replace />;
  }

  return <Outlet />;
}

