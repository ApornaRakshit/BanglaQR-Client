import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { authApi } from "../../services/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function validateEmail(val) {
    const trimmed = String(val ?? "").trim();
    if (!trimmed) return "Registered email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return "";
  }

  function handleChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validateEmail(val));
    }
  }

  function handleBlur() {
    setTouched(true);
    setError(validateEmail(email));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setApiError("");
    setSuccessMessage("");

    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setSuccessMessage(
        response?.message ||
          "If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder."
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-white pl-9 pr-3 py-2.5 text-[12px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/15 disabled:bg-slate-50 disabled:text-slate-400";
  const labelBase = "block text-[11px] font-semibold text-slate-700";

  return (
    <AuthLayout>
      <AuthCardBrand />

      <div className="space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Forgot your password?
        </h1>
        <p className="text-[11.5px] leading-relaxed text-slate-500 max-w-sm mx-auto">
          Enter the email address associated with your BanglaQR account to reset your password.
        </p>
      </div>

      {successMessage ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#00a86b] shrink-0 mt-0.5" />
              <div className="space-y-1 text-[11.5px] leading-relaxed">
                <p className="font-semibold text-emerald-950">Check your inbox</p>
                <p className="text-emerald-800">{successMessage}</p>
                <p className="text-[10.5px] text-emerald-700 pt-1">
                  The link will expire in 15 minutes for your security.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setEmail("");
                setTouched(false);
              }}
              className="
                flex h-10 w-full items-center justify-center gap-2
                rounded-full border border-slate-200 bg-white
                px-4 text-[11.5px] font-semibold text-slate-700
                transition hover:bg-slate-50
              "
            >
              <span>Send to a different email</span>
            </button>

            <Link
              to="/login"
              className="
                flex h-11 w-full items-center justify-center gap-2
                rounded-full bg-[#00a86b]
                px-4 text-[12px] font-bold text-white
                shadow-lg shadow-emerald-700/15
                transition hover:bg-[#008f5a]
              "
            >
              <ArrowLeft size={15} className="stroke-[2.6]" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {apiError && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-[11.5px] text-red-800">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label className={labelBase} htmlFor="email">
                Registered Email Address <span className="text-red-500">*</span>
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
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@company.com"
                  disabled={loading}
                  autoComplete="email"
                  className={`${inputBase} ${
                    error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
                  }`}
                />
              </div>

              {error && (
                <p className="text-[10px] font-medium leading-4 text-red-600">
                  {error}
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
              <span>{loading ? "Sending reset link..." : "Send Reset Link"}</span>
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

