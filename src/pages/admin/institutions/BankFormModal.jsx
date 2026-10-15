import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Upload,
  Landmark,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  User,
  Briefcase,
  Search,
  Sparkles,
  Info,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";

const BANK_CATEGORIES = [
  { value: "commercial_conventional", label: "Commercial Conventional" },
  { value: "commercial_islamic", label: "Commercial Islamic" },
  { value: "specialized", label: "Specialized Bank" },
  { value: "foreign_commercial", label: "Foreign Commercial Bank" },
  { value: "digital_bank", label: "Digital Bank" },
];

const OWNERSHIP_TYPES = [
  { value: "private", label: "Private" },
  { value: "state_owned", label: "State-Owned / Government" },
  { value: "foreign", label: "Foreign" },
  { value: "joint_venture", label: "Joint Venture" },
];

const BANKING_MODELS = [
  { value: "conventional", label: "Conventional" },
  { value: "islamic", label: "Islamic" },
  { value: "specialized", label: "Specialized" },
  { value: "digital", label: "Digital" },
];

function getCategoryLabel(category, ownership) {
  const cat = BANK_CATEGORIES.find((c) => c.value === category)?.label || category || "Commercial";
  const own = OWNERSHIP_TYPES.find((o) => o.value === ownership)?.label || ownership || "";
  return own ? `${cat} — ${own}` : cat;
}

export default function BankFormModal({ isOpen, onClose, bank, initialCategory = "all", onSuccess }) {
  const isMfsInit = bank
    ? (bank.type === "mfs" || bank.institution_type === "mfs")
    : (initialCategory === "mfs");

  const [categoryTab, setCategoryTab] = useState(isMfsInit ? "mfs" : "bank");
  const [parentBankOptions, setParentBankOptions] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameBn: "",
    legalName: "",
    type: isMfsInit ? "mfs" : "commercial_bank",
    status: "active",
    partnershipStatus: "active_partner",
    directoryStatus: "verified",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    supportPhone: "",
    websiteUrl: "",
    headOfficeAddress: "",
    division: "",
    district: "",
    upazila: "",
    postalCode: "",
    adminNotes: "",
    description: "",
    // Bank Profile
    swiftCode: "",
    officialBankCode: "",
    bankCategory: "commercial_conventional",
    ownershipType: "private",
    bankingModel: "conventional",
    regulatoryReference: "",
    officialContactPerson: "",
    contactDesignation: "",
    // MFS Profile
    brandName: "",
    legalOperatorName: "",
    providerCode: "",
    parentBankId: "",
    merchantApplicationSupported: true,
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  // Catalogue Dropdown State
  const [catalogueBanks, setCatalogueBanks] = useState([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);
  const [selectedCatalogueBankId, setSelectedCatalogueBankId] = useState("");
  const [selectedCatalogueBank, setSelectedCatalogueBank] = useState(null);
  const [isCustomUnlisted, setIsCustomUnlisted] = useState(false);
  const [searchCatalogue, setSearchCatalogue] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Load geo divisions & parent bank options on mount
  useEffect(() => {
    if (isOpen) {
      adminApi
        .getGeoDivisions()
        .then((res) => setDivisions(res?.data || res || []))
        .catch((err) => console.error("Failed to load geo divisions:", err));

      adminApi
        .getBankOptions({ category: "banks", limit: 100 })
        .then((res) => {
          const list = res?.data || res?.institutions || res || [];
          setParentBankOptions(Array.isArray(list) ? list : []);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Load catalogue bank options when opened in add mode
  useEffect(() => {
    if (isOpen && !bank) {
      setLoadingCatalogue(true);
      adminApi
        .getBankOptions({
          category: categoryTab === "mfs" ? "mfs" : "banks",
          limit: 100,
        })
        .then((res) => {
          const list = res?.data || res?.institutions || res || [];
          setCatalogueBanks(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.error("Failed to load catalogue options:", err);
        })
        .finally(() => {
          setLoadingCatalogue(false);
        });
    }
  }, [isOpen, bank, categoryTab]);

  // Initialize form state
  useEffect(() => {
    if (bank) {
      const isBankMfs = (bank.type || bank.institution_type) === "mfs";
      setCategoryTab(isBankMfs ? "mfs" : "bank");

      const initialDiv = bank.division || "";
      const initialDist = bank.district || "";

      setFormData({
        code: bank.code || bank.institution_code || "",
        name: bank.name || "",
        nameBn: bank.name_bn || bank.nameBn || "",
        legalName: bank.legal_name || bank.legalName || "",
        type: bank.type || bank.institution_type || (isBankMfs ? "mfs" : "commercial_bank"),
        status: bank.status || "active",
        partnershipStatus: bank.partnership_status || bank.partnershipStatus || "active_partner",
        directoryStatus: bank.directory_status || bank.directoryStatus || "verified",
        logoUrl: bank.logo_url || bank.logoUrl || "",
        contactEmail: bank.support_email || bank.contact_email || bank.contactEmail || "",
        contactPhone: bank.support_phone || bank.contact_phone || bank.contactPhone || "",
        supportPhone: bank.support_phone || bank.supportPhone || "",
        websiteUrl: bank.website_url || bank.websiteUrl || "",
        headOfficeAddress: bank.head_office_address || bank.headOfficeAddress || "",
        division: initialDiv,
        district: initialDist,
        upazila: bank.upazila || "",
        postalCode: bank.postal_code || bank.postalCode || "",
        adminNotes: bank.admin_notes || bank.adminNotes || "",
        description: bank.description || "",
        swiftCode: bank.swift_code || bank.swiftCode || "",
        officialBankCode: bank.official_bank_code || bank.officialBankCode || "",
        bankCategory: bank.bank_category || bank.bankCategory || "commercial_conventional",
        ownershipType: bank.ownership_type || bank.ownershipType || "private",
        bankingModel: bank.banking_model || bank.bankingModel || "conventional",
        regulatoryReference: bank.regulatory_reference || bank.regulatoryReference || "",
        officialContactPerson: bank.official_contact_person || bank.officialContactPerson || "",
        contactDesignation: bank.contact_designation || bank.contactDesignation || "",
        // MFS Profile
        brandName: bank.mfs_brand_name || bank.brand_name || bank.name || "",
        legalOperatorName: bank.mfs_legal_operator_name || bank.legal_operator_name || bank.legal_name || "",
        providerCode: bank.mfs_provider_code || bank.provider_code || bank.code || bank.institution_code || "",
        parentBankId: bank.mfs_parent_bank_id || bank.parent_bank_id || "",
        merchantApplicationSupported: bank.merchant_application_supported !== 0,
      });

      setSelectedCatalogueBankId(bank.id);
      setSelectedCatalogueBank(bank);
      setIsCustomUnlisted(false);

      if (initialDiv) {
        adminApi
          .getGeoDistricts({ division: initialDiv })
          .then((res) => setDistricts(res?.data || res || []))
          .catch(() => {});
      } else {
        setDistricts([]);
      }

      if (initialDist) {
        adminApi
          .getGeoUpazilas({ district: initialDist })
          .then((res) => setUpazilas(res?.data || res || []))
          .catch(() => {});
      } else {
        setUpazilas([]);
      }
    } else {
      const isMfsMode = initialCategory === "mfs";
      setCategoryTab(isMfsMode ? "mfs" : "bank");

      // Add mode: default fresh state
      setFormData({
        code: "",
        name: "",
        nameBn: "",
        legalName: "",
        type: isMfsMode ? "mfs" : "commercial_bank",
        status: "active",
        partnershipStatus: "active_partner",
        directoryStatus: "verified",
        logoUrl: "",
        contactEmail: "",
        contactPhone: "",
        supportPhone: "",
        websiteUrl: "",
        headOfficeAddress: "",
        division: "",
        district: "",
        upazila: "",
        postalCode: "",
        adminNotes: isMfsMode ? "Onboarded via Bangladesh Bank MFS directory" : "Onboarded via Bangladesh Bank master catalogue",
        description: "",
        swiftCode: "",
        officialBankCode: "",
        bankCategory: "commercial_conventional",
        ownershipType: "private",
        bankingModel: "conventional",
        regulatoryReference: "",
        officialContactPerson: "",
        contactDesignation: "",
        brandName: "",
        legalOperatorName: "",
        providerCode: "",
        parentBankId: "",
        merchantApplicationSupported: true,
      });
      setSelectedCatalogueBankId("");
      setSelectedCatalogueBank(null);
      setIsCustomUnlisted(false);
      setSearchCatalogue("");
      setDistricts([]);
      setUpazilas([]);
    }
    setError("");
  }, [bank, isOpen, initialCategory]);

  // Filter catalogue banks by search term
  const filteredCatalogueBanks = useMemo(() => {
    if (!searchCatalogue.trim()) return catalogueBanks;
    const term = searchCatalogue.toLowerCase().trim();
    return catalogueBanks.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.name_bn?.toLowerCase().includes(term) ||
        b.institution_code?.toLowerCase().includes(term) ||
        b.swift_code?.toLowerCase().includes(term) ||
        b.official_bank_code?.toLowerCase().includes(term)
    );
  }, [catalogueBanks, searchCatalogue]);

  if (!isOpen) return null;

  // Handle selecting a bank from the preloaded master catalogue dropdown
  const handleSelectCatalogueBank = (bankId) => {
    const selected = catalogueBanks.find((b) => Number(b.id) === Number(bankId));
    if (!selected) {
      setSelectedCatalogueBankId("");
      setSelectedCatalogueBank(null);
      return;
    }

    setSelectedCatalogueBankId(selected.id);
    setSelectedCatalogueBank(selected);

    const divName = selected.division || "";
    const distName = selected.district || "";

    setFormData({
      code: selected.code || selected.institution_code || "",
      name: selected.name || "",
      nameBn: selected.name_bn || selected.nameBn || "",
      legalName: selected.legal_name || selected.legalName || selected.name || "",
      type: selected.type || selected.institution_type || "commercial_bank",
      status: selected.status && selected.status !== "draft" ? selected.status : "active",
      partnershipStatus:
        selected.partnership_status && selected.partnership_status !== "none"
          ? selected.partnership_status
          : "active_partner",
      directoryStatus: selected.directory_status || "verified",
      logoUrl: selected.logo_url || selected.logoUrl || "",
      contactEmail: selected.support_email || selected.contact_email || selected.contactEmail || "",
      contactPhone: selected.support_phone || selected.contact_phone || selected.contactPhone || "",
      supportPhone: selected.support_phone || selected.supportPhone || "",
      websiteUrl: selected.website_url || selected.websiteUrl || "",
      headOfficeAddress: selected.head_office_address || selected.headOfficeAddress || "",
      division: divName,
      district: distName,
      upazila: selected.upazila || "",
      postalCode: selected.postal_code || selected.postalCode || "",
      adminNotes:
        selected.admin_notes ||
        "Registered via Bangladesh Bank master catalogue on " + new Date().toISOString().split("T")[0],
      description: selected.description || "",
      swiftCode: selected.swift_code || selected.swiftCode || "",
      officialBankCode: selected.official_bank_code || selected.officialBankCode || "",
      bankCategory: selected.bank_category || selected.bankCategory || "commercial_conventional",
      ownershipType: selected.ownership_type || selected.ownershipType || "private",
      bankingModel: selected.banking_model || selected.bankingModel || "conventional",
      regulatoryReference: selected.regulatory_reference || selected.regulatoryReference || "",
      officialContactPerson: selected.official_contact_person || selected.officialContactPerson || "",
      contactDesignation: selected.contact_designation || selected.contactDesignation || "",
      // MFS Profile
      brandName: selected.brand_name || selected.mfs_brand_name || selected.name || "",
      legalOperatorName: selected.legal_operator_name || selected.mfs_legal_operator_name || selected.legal_name || selected.name || "",
      providerCode: selected.provider_code || selected.mfs_provider_code || selected.code || selected.institution_code || "",
      parentBankId: selected.parent_bank_id || selected.mfs_parent_bank_id || "",
      merchantApplicationSupported: selected.merchant_application_supported !== 0,
    });

    // Cascading geographic dropdowns
    if (divName) {
      adminApi
        .getGeoDistricts({ division: divName })
        .then((res) => setDistricts(res?.data || res || []))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }

    if (distName) {
      adminApi
        .getGeoUpazilas({ district: distName })
        .then((res) => setUpazilas(res?.data || res || []))
        .catch(() => setUpazilas([]));
    } else {
      setUpazilas([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase().replace(/\s+/g, "_") : value,
    }));
  };

  const handleDivisionChange = (e) => {
    const divName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      division: divName,
      district: "",
      upazila: "",
    }));

    if (divName) {
      adminApi
        .getGeoDistricts({ division: divName })
        .then((res) => setDistricts(res?.data || res || []))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
    setUpazilas([]);
  };

  const handleDistrictChange = (e) => {
    const distName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: distName,
      upazila: "",
    }));

    if (distName) {
      adminApi
        .getGeoUpazilas({ district: distName })
        .then((res) => setUpazilas(res?.data || res || []))
        .catch(() => setUpazilas([]));
    } else {
      setUpazilas([]);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image file size must not exceed 2MB.");
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const data = new FormData();
      data.append("logo", file);

      const res = await adminApi.uploadInstitutionLogo(data);
      const uploadedUrl = res?.data?.url || res?.data?.logoUrl || res?.url || res?.logoUrl;

      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      } else {
        throw new Error("Logo URL was not returned by server.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Bank / Institution name is required.");
      return;
    }
    if (!formData.code.trim()) {
      setError("Institution unique code is required.");
      return;
    }

    setSubmitting(true);
    try {
      const rawType = formData.type || "commercial_bank";
      const validTypes = [
        "bank",
        "commercial_bank",
        "specialized_bank",
        "digital_bank",
        "mfs",
        "payment_gateway",
        "other",
      ];
      const mappedType = validTypes.includes(rawType)
        ? rawType
        : rawType === "psp"
        ? "payment_gateway"
        : "commercial_bank";

      const payload = {
        name: formData.name.trim(),
        nameBn: formData.nameBn.trim() || null,
        legalName: formData.legalName.trim() || null,
        institutionCode: formData.code.trim().toUpperCase(),
        code: formData.code.trim().toUpperCase(),
        institutionType: mappedType,
        type: mappedType,
        status: formData.status,
        partnershipStatus: formData.partnershipStatus,
        directoryStatus: formData.directoryStatus,
        logoUrl: formData.logoUrl.trim() || null,
        supportEmail: formData.contactEmail.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        supportPhone: formData.contactPhone.trim() || formData.supportPhone.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        websiteUrl: formData.websiteUrl.trim() || null,
        headOfficeAddress: formData.headOfficeAddress.trim() || null,
        division: formData.division || null,
        district: formData.district || null,
        upazila: formData.upazila || null,
        postalCode: formData.postalCode?.trim() || null,
        adminNotes: formData.adminNotes?.trim() || null,
        description: formData.description.trim() || null,
        // Bank Profile
        swiftCode: formData.swiftCode.trim().toUpperCase() || null,
        officialBankCode: formData.officialBankCode.trim() || null,
        bankCategory: formData.bankCategory || null,
        ownershipType: formData.ownershipType || null,
        bankingModel: formData.bankingModel?.trim() || null,
        regulatoryReference: formData.regulatoryReference.trim() || null,
        officialContactPerson: formData.officialContactPerson.trim() || null,
        contactDesignation: formData.contactDesignation.trim() || null,
        // MFS Profile
        brandName: formData.brandName?.trim() || formData.name.trim(),
        legalOperatorName: formData.legalOperatorName?.trim() || formData.legalName?.trim() || formData.name.trim(),
        providerCode: formData.providerCode?.trim()?.toUpperCase() || formData.code.trim().toUpperCase(),
        parentBankId: formData.parentBankId ? Number(formData.parentBankId) : null,
        merchantApplicationSupported: Boolean(formData.merchantApplicationSupported),
      };

      if (bank?.id) {
        // Edit mode: Update existing bank record
        await adminApi.updateInstitution(bank.id, payload);
        onSuccess("Institution updated successfully");
      } else if (selectedCatalogueBankId) {
        // Dropdown-based Registration: Update existing canonical catalogue bank (ZERO DUPLICATES)
        await adminApi.registerInstitution(selectedCatalogueBankId, payload);
        onSuccess(`${formData.type === "mfs" ? "MFS Provider" : "Bank"} "${formData.name}" successfully registered as active partner!`);
      } else {
        // Custom Unlisted Institution Creation
        await adminApi.createInstitution(payload);
        onSuccess("Institution created successfully");
      }

      onClose();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.map((e) => e.message).join(", ") ||
        "Failed to save institution record.";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {bank ? `Edit Bank / Institution: ${bank.name}` : "Register New Banking Partner"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {bank
                  ? "Update institution profile, contact details, and platform status"
                  : "Select from Bangladesh Bank master directory to auto-fill official details"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Unified Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3.5 text-xs flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Preloaded Bank Selection Dropdown (Only in Add Mode) */}
            {/* Step 1: Preloaded Institution Selection Dropdown (Only in Add Mode) */}
            {!bank && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/30 dark:border-emerald-500/20 space-y-3">
                {/* Category Switcher Tabs */}
                <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800/60 pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
                    Institution Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryTab("bank");
                      setFormData((prev) => ({
                        ...prev,
                        type: "commercial_bank",
                        adminNotes: "Onboarded via Bangladesh Bank master catalogue",
                      }));
                      setSelectedCatalogueBankId("");
                      setSelectedCatalogueBank(null);
                      setSearchCatalogue("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      categoryTab === "bank"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <Landmark size={14} />
                    Scheduled Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryTab("mfs");
                      setFormData((prev) => ({
                        ...prev,
                        type: "mfs",
                        adminNotes: "Onboarded via Bangladesh Bank MFS directory",
                      }));
                      setSelectedCatalogueBankId("");
                      setSelectedCatalogueBank(null);
                      setSearchCatalogue("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      categoryTab === "mfs"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <Smartphone size={14} />
                    MFS Provider
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>
                          {categoryTab === "mfs"
                            ? "Select MFS Provider from Bangladesh Bank Directory"
                            : "Select Bank from Bangladesh Bank Master Catalogue"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          {catalogueBanks.length} {categoryTab === "mfs" ? "MFS Providers" : "Banks"} Preloaded
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {categoryTab === "mfs"
                          ? "Selecting an MFS provider auto-fills verified brand, operator, and parent institution details."
                          : "Selecting a bank auto-fills verified official data, avoiding manual typing and duplicates."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomUnlisted(!isCustomUnlisted);
                      if (!isCustomUnlisted) {
                        setSelectedCatalogueBankId("");
                        setSelectedCatalogueBank(null);
                      }
                    }}
                    className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                  >
                    {isCustomUnlisted
                      ? `← Back to ${categoryTab === "mfs" ? "MFS Directory" : "Catalogue Selection"}`
                      : `Register Unlisted / Custom ${categoryTab === "mfs" ? "MFS Provider" : "Institution"}`}
                  </button>
                </div>

                {!isCustomUnlisted && (
                  <div className="space-y-2 pt-1">
                    {/* Search & Select Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1 relative">
                        <input
                          type="text"
                          value={searchCatalogue}
                          onChange={(e) => setSearchCatalogue(e.target.value)}
                          placeholder={categoryTab === "mfs" ? "Filter MFS (e.g. bKash, Nagad, Rocket)..." : "Filter catalogue (e.g. Sonali, BRAC, DBL)..."}
                          className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                      </div>

                      <div className="sm:col-span-2">
                        <select
                          value={selectedCatalogueBankId}
                          onChange={(e) => handleSelectCatalogueBank(e.target.value)}
                          disabled={loadingCatalogue}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        >
                          <option value="">
                            {loadingCatalogue
                              ? "Loading official Bangladesh Bank directory..."
                              : categoryTab === "mfs"
                              ? `-- Select an MFS Provider (${filteredCatalogueBanks.length} listed) --`
                              : `-- Select a Bank to Register (${filteredCatalogueBanks.length} listed) --`}
                          </option>
                          {filteredCatalogueBanks.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} {b.name_bn ? `(${b.name_bn})` : ""} — {categoryTab === "mfs" ? (b.parent_bank_name ? `Subsidiary of ${b.parent_bank_name}` : "Independent MFS") : getCategoryLabel(b.bank_category, b.ownership_type)}{" "}
                              {b.is_registered ? "✓ [Already Registered]" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Feedback Callout upon Selection */}
                    {selectedCatalogueBank && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedCatalogueBank.name}
                            </span>{" "}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              ({selectedCatalogueBank.institution_code})
                            </span>
                            {selectedCatalogueBank.is_registered && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Active Partner
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                          ✓ Auto-filled verified details
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Logo Upload Section */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {formData.logoUrl ? (
                  <img
                    src={resolveImageUrl(formData.logoUrl)}
                    alt="Logo preview"
                    className="h-full w-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-emerald-600" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload Custom Logo</span>
                      </>
                    )}
                  </button>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, logoUrl: "" }))}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  PNG, SVG, or JPG (max 2MB). Official logos are loaded from catalogue where available.
                </p>
                {formData.logoUrl && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                    Logo Source: {formData.logoUrl}
                  </p>
                )}
              </div>
            </div>

            {/* Section 1: General Identity */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <Building size={14} className="text-emerald-600" />
                <span>General Identity</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. BRAC Bank PLC"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution Unique Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. BRAC, SONALI, DBL"
                    required
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bengali Name (বাংলা নাম)
                  </label>
                  <input
                    type="text"
                    name="nameBn"
                    value={formData.nameBn}
                    onChange={handleChange}
                    placeholder="e.g. ব্র্যাক ব্যাংক পিএলসি"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Legal / Registered Entity Name
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    placeholder="e.g. BRAC Bank PLC"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="commercial_bank">Commercial Bank</option>
                    <option value="specialized_bank">Specialized Bank</option>
                    <option value="digital_bank">Digital Bank</option>
                    <option value="mfs">Mobile Financial Service (MFS)</option>
                    <option value="payment_gateway">Payment Service Provider / Gateway</option>
                    <option value="other">Other Financial Institution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active (Operational & visible)</option>
                    <option value="draft">Draft (Under onboarding / setup)</option>
                    <option value="inactive">Inactive (Temporarily suspended)</option>
                    <option value="suspended">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Channels */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <Mail size={14} className="text-emerald-600" />
                <span>Contact Channels</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Official Contact Email
                    </label>
                    {!formData.contactEmail && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Not verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="enquiry@bank.com"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Support / Contact Phone
                    </label>
                    {!formData.contactPhone && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Not verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="16221 / +880 2 222288000"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Official Website URL
                    </label>
                    {!formData.websiteUrl && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Not verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://www.bank.com"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <Globe size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Head Office & Address */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <MapPin size={14} className="text-emerald-600" />
                <span>Head Office & Address</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Head Office Street Address
                    </label>
                    {!formData.headOfficeAddress && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Not verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="headOfficeAddress"
                      value={formData.headOfficeAddress}
                      onChange={handleChange}
                      placeholder="e.g. Anik Tower, 220/B Tejgaon I/A, Dhaka-1208"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <MapPin size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Institution Regulatory & Operational Profile */}
            {categoryTab === "mfs" || formData.type === "mfs" ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <Smartphone size={14} className="text-emerald-600" />
                  <span>MFS Regulatory Profile & Provider Identifiers</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      MFS Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleChange}
                      placeholder="e.g. bKash, Rocket, Nagad"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Legal Operator Name
                    </label>
                    <input
                      type="text"
                      name="legalOperatorName"
                      value={formData.legalOperatorName}
                      onChange={handleChange}
                      placeholder="e.g. bKash Limited"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      MFS Provider Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="providerCode"
                      value={formData.providerCode}
                      onChange={handleChange}
                      placeholder="e.g. BKASH, ROCKET"
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Parent / Sponsoring Scheduled Bank
                    </label>
                    <select
                      name="parentBankId"
                      value={formData.parentBankId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- None / Independent MFS Provider (e.g. Nagad) --</option>
                      {parentBankOptions.map((pb) => (
                        <option key={pb.id} value={pb.id}>
                          {pb.name} {pb.institution_code ? `(${pb.institution_code})` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Select the scheduled bank if this MFS is an operating subsidiary (e.g. BRAC Bank for bKash, DBBL for Rocket, UCB for Upay).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      BB MFS License / Reference
                    </label>
                    <input
                      type="text"
                      name="regulatoryReference"
                      value={formData.regulatoryReference}
                      onChange={handleChange}
                      placeholder="e.g. PSD(MFS)01/2011"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Contact Person
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="officialContactPerson"
                        value={formData.officialContactPerson}
                        onChange={handleChange}
                        placeholder="e.g. Head of Merchant Payments"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person Designation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="contactDesignation"
                        value={formData.contactDesignation}
                        onChange={handleChange}
                        placeholder="e.g. Merchant Partnerships Director"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <Briefcase size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.merchantApplicationSupported)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          merchantApplicationSupported: e.target.checked,
                        }))
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Enable merchant direct registration / application for this MFS gateway
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Bank Regulatory Profile & Key Identifiers</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleChange}
                      placeholder="e.g. BRAKBDDH"
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Bank Code
                    </label>
                    <input
                      type="text"
                      name="officialBankCode"
                      value={formData.officialBankCode}
                      onChange={handleChange}
                      placeholder="e.g. 060"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Banking Model
                    </label>
                    <select
                      name="bankingModel"
                      value={formData.bankingModel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {BANKING_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Category
                    </label>
                    <select
                      name="bankCategory"
                      value={formData.bankCategory}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {BANK_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ownership Type
                    </label>
                    <select
                      name="ownershipType"
                      value={formData.ownershipType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {OWNERSHIP_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      BB Regulatory Reference
                    </label>
                    <input
                      type="text"
                      name="regulatoryReference"
                      value={formData.regulatoryReference}
                      onChange={handleChange}
                      placeholder="e.g. BRPD(P-3)744/2001"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Contact Person
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="officialContactPerson"
                        value={formData.officialContactPerson}
                        onChange={handleChange}
                        placeholder="e.g. Md. Rafiqul Islam"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person Designation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="contactDesignation"
                        value={formData.contactDesignation}
                        onChange={handleChange}
                        placeholder="e.g. Head of Merchant Acquiring"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <Briefcase size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: BanglaQR Platform Registration Settings */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 border-b border-emerald-200 dark:border-emerald-800/40 pb-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>BanglaQR Platform Registration Settings</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Partnership Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="partnershipStatus"
                    value={formData.partnershipStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active_partner">Active Partner (Full BanglaQR Integration)</option>
                    <option value="mou_signed">MOU Signed (Onboarding)</option>
                    <option value="in_discussion">In Discussion</option>
                    <option value="none">Catalogue Only (Unregistered)</option>
                    <option value="partner_suspended">Partner Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Directory Verification Status
                  </label>
                  <select
                    name="directoryStatus"
                    value={formData.directoryStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="verified">Verified (Official BB Master Record)</option>
                    <option value="listed">Listed</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    name="adminNotes"
                    value={formData.adminNotes}
                    onChange={handleChange}
                    placeholder="e.g. Registered from Bangladesh Bank master catalogue on 2026-10-15"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Overview & Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description & Overview
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the banking institution and acquiring capabilities..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {bank ? (
                <span>Editing canonical bank ID: {bank.id}</span>
              ) : selectedCatalogueBank ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  Registering catalogue bank ID: {selectedCatalogueBank.id} (Zero duplicates)
                </span>
              ) : (
                <span>Creating new institution</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingLogo}
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>
                      {bank
                        ? "Save Changes"
                        : selectedCatalogueBankId
                        ? "Register Bank"
                        : "Create Institution"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
