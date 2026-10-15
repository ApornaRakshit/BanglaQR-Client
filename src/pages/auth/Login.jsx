import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Landmark,
  Shield,
  Building2,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { useAuth } from "../../context/AuthContext";

function resolveUserPortals(userData) {
  if (!userData) return [];

  const portals = [];
  const roles = userData.roles || (userData.role ? [userData.role] : []);
  const isAdmin = roles.some((r) =>
    ["super_admin", "admin", "reviewer", "support_agent"].includes(r)
  );

  if (isAdmin) {
    portals.push({
      id: "admin",
      title: "Platform Admin Portal",
      subtitle: "System configuration, gateways, institutions & audit logs",
      path: "/admin/dashboard",
      role: userData.role || "Admin",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
      icon: Shield,
    });
  }

  const isMerchant =
    roles.includes("merchant") || userData.role === "merchant" || Boolean(userData.isMerchant);

  if (isMerchant) {
    portals.push({
      id: "merchant",
      title: "Merchant Portal",
      subtitle: "Manage stores, BanglaQR codes, settlements & transactions",
      path: "/merchant/dashboard",
      role: "Merchant",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      icon: Building2,
    });
  }

  const memberships = Array.isArray(userData.institutionMemberships)
    ? userData.institutionMemberships.filter((m) => m.status !== "suspended" && m.status !== "inactive")
    : userData.institution && userData.institution.status !== "suspended"
    ? [userData.institution]
    : [];

  memberships.forEach((m) => {
    const instId = m.institutionId || m.id;
    const instName = m.institution_name || m.name || "Banking Partner";
    const roleName = m.institution_role || m.role || "Staff";
    portals.push({
      id: `institution-${instId}`,
      title: `${instName} Portal`,
      subtitle: `KYC Reviewer & Banking Operations (${roleName})`,
      path: `/institution/dashboard?institutionId=${instId}`,
      role: roleName,
      institutionId: instId,
      badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
      icon: Landmark,
    });
  });

  return portals;
}

function resolveDestination(portals, requestedPath) {
  if (requestedPath && typeof requestedPath === "string" && requestedPath !== "/" && requestedPath !== "/login") {
    if (requestedPath.startsWith("/admin") && portals.some((p) => p.id === "admin")) {
      return requestedPath;
    }
    if (requestedPath.startsWith("/merchant") && portals.some((p) => p.id === "merchant")) {
      return requestedPath;
    }
    if (requestedPath.startsWith("/institution") && portals.some((p) => p.id.startsWith("institution-"))) {
      return requestedPath;
    }
  }

  if (portals.length === 1) {
    return portals[0].path;
  }

  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [portalSelection, setPortalSelection] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const portals = resolveUserPortals(user);
      const searchParams = new URLSearchParams(location.search);
      const requested = searchParams.get("redirect") || location.state?.from;

      const destination = resolveDestination(portals, requested);
      if (destination) {
        navigate(destination, { replace: true });
      } else if (portals.length > 1) {
        setPortalSelection(portals);
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.state, location.search]);

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const infoMessage = location.state?.message || "";

  function validateField(name, value) {
    const val = String(value ?? "").trim();

    if (name === "email") {
      if (!val) return "Business email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return "Please enter a valid business email";
      }
    }

    if (name === "password" && !val) {
      return "Password is required";
    }

    return "";
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: fieldValue }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue),
      }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  }

  function validateAll() {
    const nextErrors = {};

    ["email", "password"].forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) nextErrors[field] = error;
    });

    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    if (!validateAll()) return;

    try {
      setLoading(true);

      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const loggedUser = response?.data?.user;
      const portals = resolveUserPortals(loggedUser);

      const searchParams = new URLSearchParams(location.search);
      let requested = searchParams.get("redirect") || location.state?.from;

      // Check marketplace pending redirect for merchants
      if (!requested && (loggedUser?.role === "merchant" || loggedUser?.roles?.includes("merchant"))) {
        try {
          const pendingStr = sessionStorage.getItem("pendingMarketplaceService");
          if (pendingStr) {
            const pending = JSON.parse(pendingStr);
            if (pending?.targetUrl) {
              requested = pending.targetUrl;
            } else if (pending?.sourceType === "addon" && pending?.rawId) {
              requested = `/merchant/addons?apply=${pending.rawId}`;
            } else if (pending?.rawId) {
              requested = `/merchant/gateways/${pending.rawId}/apply`;
            }
            sessionStorage.removeItem("pendingMarketplaceService");
          }
        } catch (e) {}
      }

      const destination = resolveDestination(portals, requested);

      if (destination) {
        navigate(destination, { replace: true });
        return;
      }

      if (portals.length > 1) {
        setPortalSelection(portals);
        return;
      }

      // If user has no authorized portal role, navigate to home (never default to merchant)
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setApiError(
        error?.response?.data?.message ||
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-[12px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/10 disabled:bg-slate-50";

  const labelBase =
    "block text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-700";

  return (
    <AuthLayout variant="login">
      <AuthCardBrand />

      {portalSelection ? (
        <div className="space-y-4">
          <div className="mb-4 text-center">
            <h1 className="text-[25px] font-black leading-tight tracking-tight text-slate-950 sm:text-[27px]">
              Select Portal
            </h1>
            <p className="mx-auto mt-1 max-w-[320px] text-[12px] leading-5 text-slate-500">
              Your account has access to multiple portals. Please select where you want to proceed:
            </p>
          </div>

          <div className="space-y-2.5">
            {portalSelection.map((portal) => {
              const Icon = portal.icon || Shield;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => navigate(portal.path, { replace: true })}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:border-[#00a86b] hover:bg-emerald-50/30 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-[#00a86b] group-hover:text-white">
                      <Icon size={19} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#00a86b]">
                          {portal.title}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${portal.badgeColor}`}>
                          {portal.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {portal.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#00a86b]" />
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                logout();
                setPortalSelection(null);
              }}
              className="text-[11.5px] font-semibold text-slate-500 hover:text-red-600 transition cursor-pointer"
            >
              Sign out &amp; switch account
            </button>
          </div>
        </div>
      ) : (
        <>

      <div className="mb-4 text-center">
        <h1 className="text-[27px] font-black leading-tight tracking-tight text-slate-950 sm:text-[29px]">
          Log in to your account
        </h1>
        <p className="mx-auto mt-1 max-w-[300px] text-[12px] leading-5 text-slate-500">
          Access your BanglaQR merchant portal to manage your business.
        </p>
      </div>

      {infoMessage && !apiError && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] font-medium leading-4 text-emerald-700">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {apiError && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium leading-4 text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-1">
          <label className={labelBase} htmlFor="email">
            Business Email <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@company.com"
              disabled={loading}
              autoComplete="email"
              className={`${inputBase} pr-3 ${
                errors.email
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-slate-200"
              }`}
            />
          </div>

          {errors.email && (
            <p className="text-[10px] font-medium leading-4 text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelBase} htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
              className={`${inputBase} ${
                errors.password
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-slate-200"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-[10px] font-medium leading-4 text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-[#00a86b]"
            />
            <span className="text-[10.5px] font-medium text-slate-600">
              Remember me
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="cursor-pointer text-[10.5px] font-semibold text-[#00a86b] hover:text-[#008f5a] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            flex h-11 w-full items-center justify-center gap-2
            rounded-full bg-[#00a86b]
            px-4 text-[12px] font-bold text-white
            shadow-lg shadow-emerald-700/15
            transition hover:bg-[#008f5a]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          <span>{loading ? "Signing in..." : "Log in"}</span>
          <ArrowRight size={15} className="stroke-[2.6]" />
        </button>

        <div className="pt-0.5 text-center">
          <div className="my-2.5 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-[10.5px] font-medium text-slate-600">
            Don&apos;t have a BanglaQR account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#00a86b] transition hover:text-[#008f5a] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
        </>
      )}

      <AuthSecurityCard
        title="Secure login"
        description="Your session is protected with secure authentication and session controls."
      />
    </AuthLayout>
  );
}
