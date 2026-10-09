import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import FormField from "../../../components/forms/FormField";
import Button from "../../../components/ui/Button";
import { merchantApi } from "../../../services/merchantApi";

export default function ContactInformation() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (merchantData?.contact) {
      setFormData({
        name: merchantData.contact.name || "",
        designation: merchantData.contact.designation || "",
        email: merchantData.contact.email || "",
        phone: merchantData.contact.phone || "",
      });
    } else if (merchantData?.verification) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || merchantData.verification.email || "",
        phone: prev.phone || merchantData.verification.phone || "",
      }));
    }
  }, [merchantData]);

  function validateField(name, value) {
    const val = String(value || "").trim();

    switch (name) {
      case "name":
        if (!val) return "Contact person name is required";
        if (val.length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s.-]+$/.test(val)) return "Name can only contain alphabetic characters and spaces";
        return "";

      case "designation":
        if (val && val.length < 2) return "Designation must be at least 2 characters";
        return "";

      case "email":
        if (!val) return "Official email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return "Please enter a valid email address (e.g. contact@business.com)";
        }
        return "";

      case "phone":
        if (!val) return "Mobile phone number is required";
        const cleanPhone = val.replace(/[\s-]/g, "");
        if (!/^(?:\+?880|0)?1[3-9]\d{8}$/.test(cleanPhone)) {
          return "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)";
        }
        return "";

      default:
        return "";
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }

  function validateAll() {
    const newErrors = {};
    const fields = ["name", "designation", "email", "phone"];

    fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(navigateNext = false) {
    if (!validateAll()) {
      setApiError("Please provide valid contact information before continuing.");
      return;
    }

    try {
      setSaving(true);
      setApiError("");
      setSuccessMessage("");

      await merchantApi.updateContact(formData);
      await reload();

      setSuccessMessage("Contact information saved successfully");

      if (navigateNext) {
        navigate("/merchant/onboarding/commercial");
      }
    } catch (err) {
      console.error("Failed to save contact info:", err);
      setApiError(
        err.response?.data?.message || "Failed to save contact information. Please check all fields."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
              02
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Contact Person Information
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 sm:text-sm">
            Authorized representative details for account communications and operational inquiries.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Primary Contact Authorization</span>
        </div>
      </div>

      {/* Notifications */}
      {apiError && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
        className="mt-6 space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name */}
          <FormField
            label="Full Name of Authorized Person"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Mohammad Rahat Khan"
            required
            error={errors.name}
            disabled={saving}
            icon={User}
            hint="Must match legal identity documents"
          />

          {/* Designation */}
          <FormField
            label="Official Designation / Role"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Managing Director / Proprietor / Head of Finance"
            disabled={saving}
            icon={Briefcase}
          />

          {/* Official Email */}
          <FormField
            label="Official Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. contact@business.com"
            required
            error={errors.email}
            disabled={saving}
            icon={Mail}
            hint="Important notifications and invoices will be sent here"
          />

          {/* Contact Phone */}
          <FormField
            label="Mobile / Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 01700000000"
            required
            error={errors.phone}
            disabled={saving}
            icon={Phone}
            hint="11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/merchant/onboarding/company")}
              icon={ArrowLeft}
              disabled={saving}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/merchant/dashboard")}
              disabled={saving}
            >
              Save & Exit
            </Button>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              loading={saving}
              icon={Save}
            >
              Save Draft
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={ArrowRight}
              iconPosition="right"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
