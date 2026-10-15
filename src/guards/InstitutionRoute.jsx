import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const INSTITUTION_ALLOWED_ROLES = [
  "bank_admin",
  "bank_reviewer",
  "bank_operations",
  "super_admin",
  "admin",
];

export default function InstitutionRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-emerald-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Authenticating Institution Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin and admin can access the institution portal for monitoring
  const isSuperOrAdmin =
    ["super_admin", "admin"].includes(user.role) ||
    (Array.isArray(user.roles) && user.roles.some((r) => ["super_admin", "admin"].includes(r)));

  // An authorized institution user must have an active membership in institution_users
  const hasActiveMembership =
    (Array.isArray(user.institutionMemberships) && user.institutionMemberships.length > 0) ||
    Boolean(user.institution || user.institutionId);

  if (!isSuperOrAdmin && !hasActiveMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4 border border-slate-100">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Active Banking Institution</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your user account ({user.email}) does not have an active banking partner assignment. Please contact your system administrator.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

