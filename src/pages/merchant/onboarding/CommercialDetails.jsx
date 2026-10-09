import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Globe,
  Server,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Coins,
} from "lucide-react";
import FormField from "../../../components/forms/FormField";
import Button from "../../../components/ui/Button";
import { merchantApi } from "../../../services/merchantApi";

export default function CommercialDetails() {
  const navigate = useNavigate();
  const { merchantData, reload, isSubmitted } = useOutletContext();

  const [formData, setFormData] = useState({
    transactionsPerDay: 0,
    transactionsPerMonth: 0,
    volumePerDay: 0,
    volumePerMonth: 0,
    maximumTicketSize: 0,
    returnUrl: "",
    merchantDomain: "",
    merchantIpAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (merchantData?.commercial) {
      setFormData({
        transactionsPerDay: merchantData.commercial.transactionsPerDay || 0,
        transactionsPerMonth: merchantData.commercial.transactionsPerMonth || 0,
        volumePerDay: merchantData.commercial.volumePerDay || 0,
        volumePerMonth: merchantData.commercial.volumePerMonth || 0,
        maximumTicketSize: merchantData.commercial.maximumTicketSize || 0,
        returnUrl: merchantData.commercial.returnUrl || "",
        merchantDomain: merchantData.commercial.merchantDomain || "",
        merchantIpAddress: merchantData.commercial.merchantIpAddress || "",
      });
    }
  }, [merchantData]);

  function validateField(name, value) {
    switch (name) {
      case "transactionsPerDay":
        if (value < 0) return "Transactions per day cannot be negative";
        return "";

      case "transactionsPerMonth":
        if (value < 0) return "Transactions per month cannot be negative";
        return "";

      case "volumePerDay":
        if (value < 0) return "Estimated volume per day cannot be negative";
        return "";

      case "volumePerMonth":
        if (value < 0) return "Estimated volume per month cannot be negative";
        return "";

      case "maximumTicketSize":
        if (value < 0) return "Maximum ticket size cannot be negative";
        return "";

      case "returnUrl":
        if (value && !/^https?:\/\/.+/.test(String(value).trim())) {
          return "Return URL must start with http:// or https://";
        }
        return "";

      case "merchantIpAddress":
        if (value && !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(String(value).trim())) {
          return "Please enter a valid IPv4 address (e.g. 103.145.12.4)";
        }
        return "";

      default:
        return "";
    }
  }

  function handleChange(e) {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    const errorMsg = validateField(name, parsedValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }

  function handleBlur(e) {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, parsedValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }

  function validateAll() {
    const newErrors = {};
    const fields = [
      "transactionsPerDay",
      "transactionsPerMonth",
      "volumePerDay",
      "volumePerMonth",
      "maximumTicketSize",
      "returnUrl",
      "merchantIpAddress",
    ];

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
      setApiError("Please correct the invalid commercial parameters before continuing.");
      return;
    }

    try {
      setSaving(true);
      setApiError("");
      setSuccessMessage("");

      await merchantApi.updateCommercial(formData);
      await reload();

      setSuccessMessage("Commercial details saved successfully");

      if (navigateNext) {
        navigate("/merchant/onboarding/kyc");
      }
    } catch (err) {
      console.error("Failed to save commercial details:", err);
      setApiError(
        err.response?.data?.message || "Failed to save commercial details. Please check all fields."
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
              03
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Commercial & Technical Details
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 sm:text-sm">
            Estimated transaction volume, maximum ticket sizing, and integration parameters.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Coins size={16} className="text-emerald-600" />
          <span>Volume Projections</span>
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

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
        className="mt-6 space-y-8"
      >
        {/* Transaction Estimates */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
            Estimated Transaction Volumes (BDT)
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              label="Estimated Transactions / Day"
              name="transactionsPerDay"
              type="number"
              min="0"
              value={formData.transactionsPerDay}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 100"
              error={errors.transactionsPerDay}
              disabled={saving}
              suffix="txns"
            />

            <FormField
              label="Estimated Transactions / Month"
              name="transactionsPerMonth"
              type="number"
              min="0"
              value={formData.transactionsPerMonth}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 3000"
              error={errors.transactionsPerMonth}
              disabled={saving}
              suffix="txns"
            />

            <FormField
              label="Maximum Single Ticket Size"
              name="maximumTicketSize"
              type="number"
              min="0"
              value={formData.maximumTicketSize}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 50000"
              error={errors.maximumTicketSize}
              disabled={saving}
              prefix="৳"
              hint="Max expected single payment value"
            />

            <FormField
              label="Estimated Volume / Day"
              name="volumePerDay"
              type="number"
              min="0"
              value={formData.volumePerDay}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 50000"
              error={errors.volumePerDay}
              disabled={saving}
              prefix="৳"
            />

            <FormField
              label="Estimated Volume / Month"
              name="volumePerMonth"
              type="number"
              min="0"
              value={formData.volumePerMonth}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 1500000"
              error={errors.volumePerMonth}
              disabled={saving}
              prefix="৳"
            />
          </div>
        </div>

        {/* Technical & Integration Endpoints */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
            Technical & Integration Endpoints
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Configure callback endpoints and authorized server origin credentials for API integrations.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Default Payment Return URL"
                name="returnUrl"
                type="url"
                value={formData.returnUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://example.com/payment/return"
                error={errors.returnUrl}
                disabled={saving}
                icon={LinkIcon}
                hint="Customer browser return redirect after transaction completion"
              />
            </div>

            <FormField
              label="Merchant Domain"
              name="merchantDomain"
              value={formData.merchantDomain}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. app.example.com"
              disabled={saving}
              icon={Globe}
              hint="Production domain hosting your merchant checkout"
            />

            <FormField
              label="Server Outbound IP Address"
              name="merchantIpAddress"
              value={formData.merchantIpAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 103.145.12.4"
              error={errors.merchantIpAddress}
              disabled={saving}
              icon={Server}
              hint="Static IP address for API whitelisting"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/merchant/onboarding/contact")}
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
