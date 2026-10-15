import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { authApi } from "../../services/authApi";
import { resolveImageUrl } from "../../utils/imageUtils";

export default function InstitutionInvitationAccept() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || token.trim().length < 8) {
      setVerifying(false);
      setVerifyError("Missing or invalid invitation token. Please check the invitation link.");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await authApi.verifyInstitutionInvitation(token.trim());
        if (isMounted) {
          if (res?.success && res?.data?.valid) {
            setInvitationData(res.data);
            setForm((prev) => ({
              ...prev,
              name: res.data.name || "",
              phone: res.data.phone || "",
            }));
          } else {
            setVerifyError(res?.message || "Invitation link is invalid or expired.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setVerifyError(
            err?.response?.data?.message ||
              "Could not verify invitation link. It may be expired or already used."
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invitationData) return;

    if (!invitationData.isExistingUser) {
      if (!form.password || form.password.length < 6) {
        setApiError("Password must be at least 6 characters long.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setApiError("Passwords do not match.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setApiError("");

      const payload = {
        token: token.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
      };

      if (!invitationData.isExistingUser) {
        payload.password = form.password;
      }

      const res = await authApi.acceptInstitutionInvitation(payload);
      if (res.success) {
        setSuccess(true);
      } else {
        setApiError(res.message || "Failed to activate account.");
      }
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "An error occurred while activating your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <AuthSecurityCard>
        <AuthCardBrand
          title="Bank & Institution Staff Activation"
          subtitle="Activate your staff access to the BanglaQR Institution Portal"
        />

        {verifying && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-700">Verifying invitation link...</p>
            <p className="text-xs text-slate-500 mt-1">Checking secure one-time credentials</p>
          </div>
        )}

        {!verifying && verifyError && (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Invitation Link Invalid</p>
                <p className="mt-1 text-red-700">{verifyError}</p>
              </div>
            </div>
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Return to Login <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {!verifying && !verifyError && success && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Account Activated Successfully!</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Your role at <strong>{invitationData?.institutionName}</strong> is now active.
              </p>
            </div>
            <button
              onClick={() => navigate("/login?portal=institution")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Log in to Institution Portal <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!verifying && !verifyError && !success && invitationData && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Institution Badge */}
            <div className="flex items-center gap-3.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
              {invitationData.institutionLogo ? (
                <img
                  src={resolveImageUrl(invitationData.institutionLogo)}
                  alt={invitationData.institutionName}
                  className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white p-1 border border-emerald-200"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-200/80 text-emerald-800">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Invited Institution
                </p>
                <p className="truncate text-sm font-bold text-slate-900">
                  {invitationData.institutionName}
                </p>
                <p className="text-xs text-slate-600">
                  Role: <span className="font-semibold text-emerald-700">{invitationData.roleName}</span>
                </p>
              </div>
            </div>

            {invitationData.isExistingUser ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3.5 text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Existing BanglaQR Account Detected
                </p>
                An account with email <strong>{invitationData.email}</strong> is already registered. Activating this invitation will grant you access to {invitationData.institutionName}. Your existing password and merchant profile will remain intact.
              </div>
            ) : null}

            {apiError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={invitationData.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-9 pr-3 text-sm text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 01700000000"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {!invitationData.isExistingUser && (
              <>
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Activating Account...
                </>
              ) : invitationData.isExistingUser ? (
                "Activate & Link Institution Membership"
              ) : (
                "Set Password & Activate Account"
              )}
            </button>
          </form>
        )}
      </AuthSecurityCard>
    </AuthLayout>
  );
}

