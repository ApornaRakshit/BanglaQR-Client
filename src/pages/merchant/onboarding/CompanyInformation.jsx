import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Save,
  AlertCircle,
  ShieldCheck,
  Building,
} from "lucide-react";
import FormField from "../../../components/forms/FormField";
import Button from "../../../components/ui/Button";
import { merchantApi } from "../../../services/merchantApi";

const BUSINESS_TYPES = [
  { value: "", label: "Select Business Type" },
  { value: "Private Limited", label: "Private Limited Company (Ltd)" },
  { value: "Public Limited", label: "Public Limited Company (PLC)" },
  { value: "Sole Proprietorship", label: "Sole Proprietorship" },
  { value: "Partnership", label: "Partnership" },
  { value: "NGO / Non-Profit", label: "NGO / Non-Profit Organization" },
  { value: "Government Entity", label: "Government Entity" },
  { value: "Other", label: "Other" },
];

const INDUSTRIES = [
  { value: "", label: "Select Industry / Category" },
  { value: "Software & Technology", label: "Software & Technology / IT" },
  { value: "E-Commerce & Retail", label: "E-Commerce & Online Retail" },
  { value: "Financial Services / Fintech", label: "Financial Services & Fintech" },
  { value: "Education & EdTech", label: "Education & EdTech" },
  { value: "Healthcare & Pharmaceuticals", label: "Healthcare & Pharmaceuticals" },
  { value: "Hospitality & Travel", label: "Hospitality, Food & Travel" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Logistics & Delivery", label: "Logistics, Shipping & Supply Chain" },
  { value: "Manufacturing & Distribution", label: "Manufacturing & Industrial" },
  { value: "Other", label: "Other Services" },
];

const DIVISIONS = [
  { value: "", label: "Select Division" },
  { value: "Dhaka", label: "Dhaka" },
  { value: "Chittagong", label: "Chattogram" },
  { value: "Rajshahi", label: "Rajshahi" },
  { value: "Khulna", label: "Khulna" },
  { value: "Barishal", label: "Barishal" },
  { value: "Sylhet", label: "Sylhet" },
  { value: "Rangpur", label: "Rangpur" },
  { value: "Mymensingh", label: "Mymensingh" },
];

export default function CompanyInformation() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    industry: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (merchantData?.profile) {
      setFormData({
        companyName: merchantData.profile.companyName || "",
        businessType: merchantData.profile.businessType || "",
        industry: merchantData.profile.industry || "",
        website: merchantData.profile.website || "",
        address: merchantData.profile.address || "",
        city: merchantData.profile.city || "",
        state: merchantData.profile.state || "",
        postalCode: merchantData.profile.postalCode || "",
        country: merchantData.profile.country || "Bangladesh",
      });
    }
  }, [merchantData]);

  function validateField(name, value) {
    const val = String(value || "").trim();

    switch (name) {
      case "companyName":
        if (!val) return "Company name is required";
        if (val.length < 2) return "Company name must be at least 2 characters";
        return "";

      case "website":
        if (val && !/^https?:\/\/.+\..+/.test(val)) {
          return "Please enter a valid website URL (e.g. https://example.com)";
        }
        return "";

      case "postalCode":
        if (val && !/^\d{4}$/.test(val)) {
          return "Postal code must be a 4-digit code (e.g. 1209)";
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
    const fields = ["companyName", "website", "postalCode"];

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
      setApiError("Please provide valid company details before continuing.");
      return;
    }

    try {
      setSaving(true);
      setApiError("");
      setSuccessMessage("");

      await merchantApi.updateCompany(formData);
      await reload();

      setSuccessMessage("Company information saved successfully");

      if (navigateNext) {
        navigate("/merchant/onboarding/contact");
      }
    } catch (err) {
      console.error("Failed to save company info:", err);
      setApiError(
        err.response?.data?.message || "Failed to save company information. Please check all fields."
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
              01
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Company Information
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 sm:text-sm">
            Provide your official business entity details and physical address.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Verified Business Entity</span>
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
          {/* Company Name */}
          <div className="md:col-span-2">
            <FormField
              label="Registered Company / Business Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. ABC Technologies Limited"
              required
              error={errors.companyName}
              disabled={saving}
              icon={Building2}
              hint="Official registered name as per Trade License or Certificate of Incorporation"
            />
          </div>

          {/* Business Type */}
          <FormField
            label="Business Entity Type"
            name="businessType"
            type="select"
            value={formData.businessType}
            onChange={handleChange}
            onBlur={handleBlur}
            options={BUSINESS_TYPES}
            disabled={saving}
            icon={Briefcase}
          />

          {/* Industry Category */}
          <FormField
            label="Industry / Business Category"
            name="industry"
            type="select"
            value={formData.industry}
            onChange={handleChange}
            onBlur={handleBlur}
            options={INDUSTRIES}
            disabled={saving}
            icon={Building}
          />

          {/* Website */}
          <div className="md:col-span-2">
            <FormField
              label="Official Website URL"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://example.com"
              error={errors.website}
              disabled={saving}
              icon={Globe}
              hint="Optional: Provide merchant landing page URL (e.g. https://example.com)"
            />
          </div>
        </div>

        {/* Address Sub-section */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            Registered Business Address
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Street Address / Building / Suite"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Level 4, House 12, Road 5, Dhanmondi"
                disabled={saving}
                icon={MapPin}
              />
            </div>

            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Dhaka"
              disabled={saving}
            />

            <FormField
              label="State / Division"
              name="state"
              type="select"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              options={DIVISIONS}
              disabled={saving}
            />

            <FormField
              label="Postal / Zip Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 1209"
              error={errors.postalCode}
              disabled={saving}
              hint="4-digit numeric code"
            />

            <FormField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled
              readOnly
              hint="BanglaQR operates primarily for merchants in Bangladesh"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/merchant/dashboard")}
            disabled={saving}
          >
            Save & Exit to Dashboard
          </Button>

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
