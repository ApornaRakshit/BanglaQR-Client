import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  HelpCircle,
  Lock,
  Sparkles,
  Check,
  Clock,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/status/StatusBadge";
import { authApi } from "../../../services/authApi";

function OtpInput({ length = 6, value, onChange, disabled }) {
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
    <div className="flex items-center gap-2 sm:gap-2.5">
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
          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        />
      ))}
    </div>
  );
}

export default function Verification() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const verification = merchantData?.verification || {};
  const email = verification.email || merchantData?.contact?.email || "";
  const phone = verification.phone || merchantData?.contact?.phone || "";
  const emailVerified = Boolean(verification.emailVerified);
  const phoneVerified = Boolean(verification.phoneVerified);

  // Email verification state
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // Phone verification state
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [resendingPhone, setResendingPhone] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [phoneSuccess, setPhoneSuccess] = useState("");

  const [generalError, setGeneralError] = useState("");

  // Countdown timers
  useEffect(() => {
    let timer;
    if (emailTimer > 0) {
      timer = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailTimer]);

  useEffect(() => {
    let timer;
    if (phoneTimer > 0) {
      timer = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneTimer]);

  // Resend / Request Email OTP
  async function handleSendEmailOtp() {
    if (!email) {
      setEmailError("No email address found. Please update Step 2 Contact Information.");
      return;
    }
    try {
      setResendingEmail(true);
      setEmailError("");
      setEmailSuccess("");
      await authApi.resendOtp({
        destination: email,
        purpose: "email_verification",
      });
      setShowEmailOtp(true);
      setEmailTimer(60);
      setEmailSuccess("Verification code sent to your email address.");
    } catch (err) {
      console.error("Resend email OTP error:", err);
      setEmailError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  }

  // Verify Email OTP
  async function handleVerifyEmail(e) {
    if (e) e.preventDefault();
    if (emailOtp.length < 6) {
      setEmailError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setVerifyingEmail(true);
      setEmailError("");
      setEmailSuccess("");

      await authApi.verify({
        destination: email,
        code: emailOtp.trim(),
        purpose: "email_verification",
      });

      setEmailSuccess("Email address verified successfully!");
      setShowEmailOtp(false);
      setEmailOtp("");
      await reload();
    } catch (err) {
      console.error("Email verification error:", err);
      setEmailError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setVerifyingEmail(false);
    }
  }

  // Resend / Request Phone OTP
  async function handleSendPhoneOtp() {
    if (!phone) {
      setPhoneError("No phone number found. Please update Step 2 Contact Information.");
      return;
    }
    try {
      setResendingPhone(true);
      setPhoneError("");
      setPhoneSuccess("");
      await authApi.resendOtp({
        destination: phone,
        purpose: "phone_verification",
      });
      setShowPhoneOtp(true);
      setPhoneTimer(60);
      setPhoneSuccess("Verification code sent to your mobile phone via SMS.");
    } catch (err) {
      console.error("Resend phone OTP error:", err);
      setPhoneError(err.response?.data?.message || "Failed to send SMS OTP. Please try again.");
    } finally {
      setResendingPhone(false);
    }
  }

  // Verify Phone OTP
  async function handleVerifyPhone(e) {
    if (e) e.preventDefault();
    if (phoneOtp.length < 6) {
      setPhoneError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setVerifyingPhone(true);
      setPhoneError("");
      setPhoneSuccess("");

      await authApi.verify({
        destination: phone,
        code: phoneOtp.trim(),
        purpose: "phone_verification",
      });

      setPhoneSuccess("Mobile phone verified successfully!");
      setShowPhoneOtp(false);
      setPhoneOtp("");
      await reload();
    } catch (err) {
      console.error("Phone verification error:", err);
      setPhoneError(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setVerifyingPhone(false);
    }
  }

  function handleContinue() {
    if (!emailVerified || !phoneVerified) {
      setGeneralError("Please verify both your email address and mobile number before continuing to review.");
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }
    navigate("/merchant/onboarding/review");
  }

  const verifiedCount = (emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0);
  const allVerified = verifiedCount === 2;

  return (
    <div className="space-y-6">
      {/* ====================================================
          TOP STEP TITLE & CONTROLS
      ===================================================== */}
      <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                06
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Verify your contact information
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Confirm your email address and mobile number before submitting your merchant application.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-semibold text-slate-700">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Two-Channel Verification</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {generalError && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* ====================================================
          TWO-COLUMN MAIN CONTENT
      ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: VERIFICATION CARDS (8 Cols) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Card 1: Email Verification */}
          <div
            className={`rounded-md border transition-all duration-200 p-5 sm:p-7 ${
              emailVerified
                ? "border-emerald-200/90 bg-emerald-50/20"
                : "border-slate-200/80 bg-white shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Mail size={22} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Email Verification
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Email Address:{" "}
                    <span className="font-bold text-slate-950 truncate">{email || "Not provided"}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Official channel for payment receipts, settlement notifications, and compliance requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <StatusBadge status={emailVerified ? "Verified" : "Not Verified"} />
              </div>
            </div>

            {/* Email Verification Action / Form */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              {emailVerified ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>✓ Email address verified</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showEmailOtp ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Click below to receive a 6-digit verification code at <span className="font-semibold text-slate-800">{email}</span>
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSendEmailOtp}
                        loading={resendingEmail}
                        icon={KeyRound}
                      >
                        Verify Email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyEmail} className="space-y-4 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Enter 6-Digit Verification Code
                        </label>
                        {emailTimer > 0 ? (
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> Resend in {emailTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            disabled={resendingEmail}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                          >
                            Resend Verification Code
                          </button>
                        )}
                      </div>

                      <OtpInput
                        length={6}
                        value={emailOtp}
                        onChange={setEmailOtp}
                        disabled={verifyingEmail}
                      />

                      {emailError && (
                        <p className="text-xs font-medium text-red-600 flex items-center gap-1.5 animate-fadeIn">
                          <AlertCircle size={14} />
                          {emailError}
                        </p>
                      )}

                      {emailSuccess && (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                          <CheckCircle2 size={14} />
                          {emailSuccess}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          loading={verifyingEmail}
                          disabled={emailOtp.length < 6}
                        >
                          Confirm Code
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowEmailOtp(false);
                            setEmailOtp("");
                            setEmailError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Mobile Number Verification */}
          <div
            className={`rounded-md border transition-all duration-200 p-5 sm:p-7 ${
              phoneVerified
                ? "border-emerald-200/90 bg-emerald-50/20"
                : "border-slate-200/80 bg-white shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    phoneVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Phone size={22} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mobile Number Verification
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Mobile Number:{" "}
                    <span className="font-bold text-slate-950 truncate">{phone || "Not provided"}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Used for two-factor authentication, security PIN resets, and urgent financial alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <StatusBadge status={phoneVerified ? "Verified" : "Not Verified"} />
              </div>
            </div>

            {/* Mobile Verification Action / Form */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              {phoneVerified ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>✓ Mobile number verified</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showPhoneOtp ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Click below to receive a 6-digit OTP code at <span className="font-semibold text-slate-800">{phone}</span>
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSendPhoneOtp}
                        loading={resendingPhone}
                        icon={KeyRound}
                      >
                        Verify Mobile
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyPhone} className="space-y-4 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Enter 6-Digit SMS OTP
                        </label>
                        {phoneTimer > 0 ? (
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> Resend in {phoneTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            disabled={resendingPhone}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <OtpInput
                        length={6}
                        value={phoneOtp}
                        onChange={setPhoneOtp}
                        disabled={verifyingPhone}
                      />

                      {phoneError && (
                        <p className="text-xs font-medium text-red-600 flex items-center gap-1.5 animate-fadeIn">
                          <AlertCircle size={14} />
                          {phoneError}
                        </p>
                      )}

                      {phoneSuccess && (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                          <CheckCircle2 size={14} />
                          {phoneSuccess}
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          loading={verifyingPhone}
                          disabled={phoneOtp.length < 6}
                        >
                          Confirm Code
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowPhoneOtp(false);
                            setPhoneOtp("");
                            setPhoneError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & SECURITY CARDS (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Contact Verification Summary */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Verification
                </p>
                <h4 className="text-base font-bold text-slate-950 mt-0.5">
                  {verifiedCount} / 2 Verified
                </h4>
              </div>

              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-bold ${
                  allVerified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {Math.round((verifiedCount / 2) * 100)}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-5">
              <div
                className={`h-full transition-all duration-300 ${
                  allVerified ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${(verifiedCount / 2) * 100}%` }}
              />
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-800">Email Address</span>
                {emailVerified ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Pending</span>
                )}
              </li>

              <li className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-800">Mobile Phone</span>
                {phoneVerified ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <Check size={14} /> Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">Pending</span>
                )}
              </li>
            </ul>
          </div>

          {/* Card 2: Why do we verify this? */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white mb-3 shadow-md shadow-emerald-600/20">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-950">
              Why do we verify this?
            </h4>
            <p className="mt-1.5 text-xs leading-5 text-emerald-950/80">
              Your email and mobile number are used to secure your merchant account and communicate important application updates.
            </p>
          </div>

          {/* Card 3: Need Help? */}
          <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Need Assistance?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you did not receive the verification code or need to update your contact information, please edit Step 2 or contact support.
            </p>
            <button
              type="button"
              onClick={() => navigate("/merchant/support")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>Contact Support</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          STICKY BOTTOM ACTION BAR
      ===================================================== */}
      <div className="sticky bottom-0 z-20 mt-8 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 sm:px-8 shadow-lg shadow-slate-900/5">
        <div className="mx-auto flex max-w-[1440px] flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/merchant/dashboard")}
          >
            Save & Exit
          </Button>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/merchant/onboarding/documents")}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleContinue}
              icon={ArrowRight}
              iconPosition="right"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
