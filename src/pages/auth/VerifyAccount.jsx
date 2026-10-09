import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Mail,
  Phone,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthSecurityCard from "../../components/auth/AuthSecurityCard";
import AuthCardBrand from "../../components/auth/AuthCardBrand";
import { authApi } from "../../services/authApi";

function OtpBoxes({ length = 6, value, onChange, disabled }) {
  const inputRefs = useRef([]);

  function handleChange(e, index) {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const newOtp = value.split("");
      newOtp[index] = "";
      onChange(newOtp.join(""));
      return;
    }

    const digit = val.slice(-1);
    const newOtp = (value + "      ").slice(0, length).split("");
    newOtp[index] = digit;
    const finalVal = newOtp.join("").trimEnd();
    onChange(finalVal);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[targetIndex]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="h-11 w-10 sm:h-12 sm:w-11 rounded-xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-900 shadow-xs transition-all focus:border-[#00a86b] focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 disabled:bg-slate-50 disabled:text-slate-400"
        />
      ))}
    </div>
  );
}

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [phone, setPhone] = useState(location.state?.phone || "");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState(
    location.state?.message || "Please enter the verification code to activate your account."
  );

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  async function handleVerify(e) {
    e.preventDefault();
    setApiError("");

    const destination = activeTab === "email" ? email.trim() : phone.trim();
    const purpose = activeTab === "email" ? "email_verification" : "phone_verification";

    if (!destination) {
      setApiError(`Please provide your ${activeTab === "email" ? "email address" : "phone number"}`);
      return;
    }

    if (!otp || otp.length !== 6) {
      setApiError("Please enter a valid 6-digit verification code");
      return;
    }

    try {
      setLoading(true);
      await authApi.verify({
        destination,
        code: otp,
        purpose,
      });

      setApiSuccess(
        `${activeTab === "email" ? "Email" : "Phone number"} verified successfully! Redirecting to login...`
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: activeTab === "email" ? email : undefined,
            message: "Account verified successfully! Please log in with your credentials.",
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      const msg = err.response?.data?.message || "Invalid or expired verification code. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setApiError("");
    const destination = activeTab === "email" ? email.trim() : phone.trim();
    const purpose = activeTab === "email" ? "email_verification" : "phone_verification";

    if (!destination) {
      setApiError(`Please provide your ${activeTab === "email" ? "email address" : "phone number"}`);
      return;
    }

    try {
      setResending(true);
      await authApi.resendOtp({
        destination,
        purpose,
      });
      setTimer(60);
      setOtp("");
      setApiSuccess(`New 6-digit code has been sent to ${destination}`);
    } catch (err) {
      console.error("Resend OTP error:", err);
      const msg = err.response?.data?.message || "Unable to resend verification code. Please try again later.";
      setApiError(msg);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout variant="verify">
      <AuthCardBrand />

      {/* Card Title & Subtitle */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-[25px] font-black text-slate-900 tracking-tight">
          Verify your account
        </h2>
        <p className="text-sm sm:text-[13px] text-slate-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
          Enter the 6-digit code sent to your registered contact.
        </p>
      </div>

      {/* Notifications */}
      {apiError && (
        <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-sm font-medium text-red-700 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {apiSuccess && !apiError && (
        <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-sm font-medium text-emerald-700 animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{apiSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setOtp("");
            setApiError("");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === "email"
              ? "bg-white text-[#00a86b] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail size={15} />
          <span>Email Code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setOtp("");
            setApiError("");
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === "phone"
              ? "bg-white text-[#00a86b] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Phone size={15} />
          <span>SMS Code</span>
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* Destination input */}
        <div className="space-y-1">
          <label className="block text-sm font-bold text-slate-800">
            {activeTab === "email" ? "Registered Email" : "Registered Mobile Number"}
          </label>
          <div className="relative rounded-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              {activeTab === "email" ? <Mail size={16} /> : <Phone size={16} />}
            </div>
            <input
              type={activeTab === "email" ? "email" : "tel"}
              value={activeTab === "email" ? email : phone}
              onChange={(e) =>
                activeTab === "email" ? setEmail(e.target.value) : setPhone(e.target.value)
              }
              placeholder={activeTab === "email" ? "name@company.com" : "01XXXXXXXXX"}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#00a86b] focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* 6-Digit OTP Box Input */}
        <div className="space-y-2 pt-1">
          <label className="block text-center text-sm font-bold uppercase tracking-wider text-slate-700">
            Enter 6-digit OTP code
          </label>
          <OtpBoxes length={6} value={otp} onChange={setOtp} disabled={loading} />
        </div>

        {/* Resend Section */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm text-slate-500">Didn&apos;t receive code?</span>
          {timer > 0 ? (
            <span className="text-sm font-semibold text-slate-400">
              Resend in {timer}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="flex items-center gap-1.5 text-sm font-bold text-[#00a86b] hover:text-[#008f5a] transition disabled:opacity-60 cursor-pointer"
            >
              <RotateCcw size={13} className={resending ? "animate-spin" : ""} />
              <span>{resending ? "Sending..." : "Resend Code"}</span>
            </button>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3 px-4 font-bold text-sm text-white bg-[#00a86b] hover:bg-[#008f5a] shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
            <ArrowRight size={16} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center">
          <p className="text-sm text-slate-600 font-medium">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-bold text-[#00a86b] hover:text-[#008f5a] hover:underline ml-1"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </form>

      {/* Security Assurance Card */}
      <AuthSecurityCard
        title="2-Factor Verification"
        description="One-time passwords ensure that only verified merchant account owners can access the portal."
      />
    </AuthLayout>
  );
}
