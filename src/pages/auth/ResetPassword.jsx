import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { authApi } from "../../services/authApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [associatedEmail, setAssociatedEmail] = useState("");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token || token.trim().length < 10) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("Missing or invalid password reset token. Please request a new link.");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const response = await authApi.verifyResetToken(token.trim());
        if (isMounted) {
          if (response?.success && response?.data?.valid) {
            setTokenValid(true);
            setAssociatedEmail(response.data.email || "");
          } else {
            setTokenValid(false);
            setTokenError(
              response?.message ||
                "This password reset link is invalid or has expired."
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(
            err?.response?.data?.message ||
              "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function validateField(name, value) {
    const val = String(value ?? "");

    if (name === "password") {
      if (!val) return "New password is required";
      if (val.length < 8) return "Password must be at least 8 characters";
    }

    if (name === "confirmPassword") {
      if (!val) return "Please confirm your new password";
      if (val !== form.password) return "Passwords do not match";
    }

    return "";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    // Dynamic matching check for confirmPassword when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.confirmPassword ? "Passwords do not match" : "",
      }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");

    const newErrors = {
      password: validateField("password", form.password),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
    };

    setTouched({ password: true, confirmPassword: true });
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token: token.trim(),
        newPassword: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(true);
      // After 2.5 seconds redirect to login or let the user click
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              response?.message ||
              "Password reset successfully! Please log in with your new password.",
            email: associatedEmail,
          },
        });
      }, 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again or request a new reset link.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-white pl-9 pr-10 py-2.5 text-[12px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/15 disabled:bg-slate-50 disabled:text-slate-400";
  const labelBase = "block text-[11px] font-semibold text-slate-700";

  return (
    <AuthLayout>
      <AuthCardBrand />

      {verifying ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00a86b]" />
          <p className="text-[12px] font-medium text-slate-600">
            Verifying your password reset link...
          </p>
        </div>
      ) : !tokenValid ? (
        <div className="space-y-5">
          <div className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Invalid or Expired Link
            </h1>
            <p className="text-[11.5px] leading-relaxed text-slate-500 max-w-sm mx-auto">
              {tokenError ||
                "This password reset link is invalid, has expired, or has already been used."}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              to="/forgot-password"
              className="
                flex h-11 w-full items-center justify-center gap-2
                rounded-full bg-[#00a86b]
                px-4 text-[12px] font-bold text-white
                shadow-lg shadow-emerald-700/15
                transition hover:bg-[#008f5a]
              "
            >
              <span>Request a new reset link</span>
              <ArrowRight size={15} className="stroke-[2.6]" />
            </Link>

            <Link
              to="/login"
              className="
                flex h-10 w-full items-center justify-center gap-2
                rounded-full border border-slate-200 bg-white
                px-4 text-[11.5px] font-semibold text-slate-700
                transition hover:bg-slate-50
              "
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      ) : success ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-[#00a86b] shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p className="font-semibold text-emerald-950">Password Reset Successful!</p>
                <p className="text-emerald-800">
                  Your password has been updated. Redirecting you to login...
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            state={{ email: associatedEmail }}
            className="
              flex h-11 w-full items-center justify-center gap-2
              rounded-full bg-[#00a86b]
              px-4 text-[12px] font-bold text-white
              shadow-lg shadow-emerald-700/15
              transition hover:bg-[#008f5a]
            "
          >
            <span>Continue to Login</span>
            <ArrowRight size={15} className="stroke-[2.6]" />
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-[#00a86b]">
              <KeyRound size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Set new password
            </h1>
            <p className="text-[11.5px] leading-relaxed text-slate-500 max-w-sm mx-auto">
              {associatedEmail
                ? `Create a strong new password for ${associatedEmail}`
                : "Create a strong new password of at least 8 characters."}
            </p>
          </div>

          {apiError && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-[11.5px] text-red-800">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* New Password */}
            <div className="space-y-1">
              <label className={labelBase} htmlFor="password">
                New Password <span className="text-red-500">*</span>
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
                  placeholder="Min 8 characters"
                  disabled={loading}
                  autoComplete="new-password"
                  className={`${inputBase} ${
                    errors.password
                      ? "border-red-300 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className={labelBase} htmlFor="confirmPassword">
                Confirm New Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter your new password"
                  disabled={loading}
                  autoComplete="new-password"
                  className={`${inputBase} ${
                    errors.confirmPassword
                      ? "border-red-300 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-[10px] font-medium leading-4 text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
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
              <span>{loading ? "Resetting password..." : "Reset Password"}</span>
              <ArrowRight size={15} className="stroke-[2.6]" />
            </button>
          </form>

          <div className="text-center pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Login</span>
            </Link>
          </div>
        </>
      )}

      <AuthSecurityCard />
    </AuthLayout>
  );
}

