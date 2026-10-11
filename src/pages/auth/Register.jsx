import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { authApi } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAgreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  function validateField(name, value, values = form) {
    const val = String(value ?? "").trim();

    switch (name) {
      case "fullName":
        if (!val) return "Full name is required";
        if (val.length < 3) return "Full name must be at least 3 characters";
        return "";

      case "email":
        if (!val) return "Business email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return "Please enter a valid business email";
        }
        return "";

      case "phone": {
        if (!val) return "Mobile number is required";
        const cleanPhone = val.replace(/[\s-]/g, "");
        if (!/^(?:\+?880|0)?1[3-9]\d{8}$/.test(cleanPhone)) {
          return "Please enter a valid Bangladesh mobile number";
        }
        return "";
      }

      case "password":
        if (!val) return "Password is required";
        if (val.length < 8) return "Password must be at least 8 characters";
        return "";

      case "confirmPassword":
        if (!val) return "Please re-enter your password";
        if (val !== values.password) return "Passwords do not match";
        return "";

      case "termsAgreed":
        if (!value) return "Please accept the Terms of Service & Privacy Policy";
        return "";

      default:
        return "";
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === "checkbox" ? checked : value;
    const nextForm = { ...form, [name]: fieldValue };

    setForm(nextForm);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue, nextForm),
      }));
    }

    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField(
          "confirmPassword",
          nextForm.confirmPassword,
          nextForm
        ),
      }));
    }
  }

  function handleBlur(event) {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, fieldValue, form),
    }));
  }

  function validateAll() {
    const fields = [
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "termsAgreed",
    ];

    const nextErrors = {};

    fields.forEach((field) => {
      const error = validateField(field, form[field], form);
      if (error) nextErrors[field] = error;
    });

    setErrors(nextErrors);
    setTouched(
      fields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    setApiSuccess("");

    if (!validateAll()) return;

    try {
      setLoading(true);

      const payload = {
        fullName: form.fullName.trim(),
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim().replace(/\s/g, ""),
        password: form.password,
      };

      const res = await authApi.register(payload);
      const isBypassed = res?.data?.verificationBypassed;

      if (isBypassed) {
        setApiSuccess(
          "Account created successfully. Redirecting to Merchant Dashboard..."
        );

        try {
          await refreshUser();
        } catch {}

        window.setTimeout(() => {
          navigate("/merchant/dashboard", { replace: true });
        }, 700);
      } else {
        setApiSuccess(
          "Account created successfully. Redirecting to verification..."
        );

        window.setTimeout(() => {
          navigate("/verify", {
            state: {
              email: payload.email,
              phone: payload.phone,
              message:
                "Account created. Please verify your email and phone number to activate your account.",
            },
          });
        }, 900);
      }
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to create account. Please check your information and try again.";

      setApiError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-[12px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/10 disabled:bg-slate-50";

  const labelBase =
    "block text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-700";

  return (
    <AuthLayout variant="register">
      <AuthCardBrand />

      <div className="mb-4 text-center">
        <h1 className="text-[27px] font-black leading-tight tracking-tight text-slate-950 sm:text-[29px]">
          Open Merchant Account
        </h1>
        <p className="mx-auto mt-1 max-w-[310px] text-[12px] leading-5 text-slate-500">
          Create your merchant account to start your BanglaQR onboarding
          journey.
        </p>
      </div>

      {apiError && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium leading-4 text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {apiSuccess && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] font-medium leading-4 text-emerald-700">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <span>{apiSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {[
          {
            name: "fullName",
            label: "Full Name",
            placeholder: "Enter your full name",
            icon: User,
            type: "text",
          },
          {
            name: "email",
            label: "Business Email",
            placeholder: "name@company.com",
            icon: Mail,
            type: "email",
          },
          {
            name: "phone",
            label: "Mobile Number",
            placeholder: "01XXXXXXXXX",
            icon: Phone,
            type: "tel",
          },
        ].map((field) => {
          const Icon = field.icon;

          return (
            <div key={field.name} className="space-y-1">
              <label className={labelBase} htmlFor={field.name}>
                {field.label} <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Icon
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={field.placeholder}
                  disabled={loading}
                  autoComplete={
                    field.name === "email"
                      ? "email"
                      : field.name === "phone"
                        ? "tel"
                        : "name"
                  }
                  className={`${inputBase} ${
                    errors[field.name]
                      ? "border-red-300 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                />
              </div>

              {errors[field.name] && (
                <p className="text-[10px] font-medium leading-4 text-red-600">
                  {errors[field.name]}
                </p>
              )}
            </div>
          );
        })}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                placeholder="Create a strong password"
                disabled={loading}
                autoComplete="new-password"
                className={`${inputBase} pr-10 ${
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

          <div className="space-y-1">
            <label className={labelBase} htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
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
                placeholder="Re-enter your password"
                disabled={loading}
                autoComplete="new-password"
                className={`${inputBase} pr-10 ${
                  errors.confirmPassword
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
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
        </div>

        <div className="pt-0.5">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              name="termsAgreed"
              checked={form.termsAgreed}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#00a86b] accent-[#00a86b]"
            />

            <span className="text-[10.5px] leading-4 text-slate-600">
              I agree to the{" "}
              <span className="font-semibold text-[#00a86b]">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-semibold text-[#00a86b]">
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {errors.termsAgreed && (
            <p className="mt-1 text-[10px] font-medium text-red-600">
              {errors.termsAgreed}
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
          <span>{loading ? "Creating account..." : "Create Merchant Account"}</span>
          <ArrowRight size={15} className="stroke-[2.6]" />
        </button>

        <div className="text-center">
          <div className="my-2.5 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-[10.5px] font-medium text-slate-600">
            Already have a BanglaQR account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#00a86b] transition hover:text-[#008f5a] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>

      <AuthSecurityCard
        title="Secure registration"
        description="Your account information is protected with secure authentication and data-protection practices."
      />
    </AuthLayout>
  );
}
