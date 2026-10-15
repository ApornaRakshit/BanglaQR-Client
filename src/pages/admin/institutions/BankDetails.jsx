import { useState, useEffect,useRef} from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import {
  Landmark,
  Building,
  MapPin,
  Globe,
  Mail,
  Phone,
  Edit2,
  Plus,
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Network,
  FileCheck,
  Sliders,
  ExternalLink,
  Trash2,
  Power,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Filter,
  Eye,
  Check,
  Loader2,
  User,
  UserPlus,
  Send,
  Copy,
  RotateCcw,
  Ban,
  Clock,
  KeyRound,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { resolveImageUrl } from "../../../utils/imageUtils";
import BankFormModal from "./BankFormModal";

export default function BankDetails() {
  const { institutionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get("tab") || "branches";

  // Institution State
  const [institution, setInstitution] = useState(null);
  const [loadingInst, setLoadingInst] = useState(true);
  const [errorInst, setErrorInst] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState(null);
  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Branch Stats & List State
  const [branchStats, setBranchStats] = useState({
    totalBranches: 0,
    divisionsCount: 0,
    districtsCount: 0,
    activeBranches: 0,
    inactiveBranches: 0,
  });
  const [branches, setBranches] = useState([]);
  const [branchPagination, setBranchPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Branch Filters
  const [branchSearch, setBranchSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedUpazila, setSelectedUpazila] = useState("all");
  const [branchStatusFilter, setBranchStatusFilter] = useState("all");
  const [branchDemoFilter, setBranchDemoFilter] = useState("all");
  const [branchIncludeArchived, setBranchIncludeArchived] = useState(false);

  // Geographic Reference Data for Filters
  const [geoDivisions, setGeoDivisions] = useState([]);
  const [geoDistricts, setGeoDistricts] = useState([]);
  const [geoUpazilas, setGeoUpazilas] = useState([]);

  // Add/Edit Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchModalError, setBranchModalError] = useState("");
  const [branchFormData, setBranchFormData] = useState({
    branchName: "",
    branchCode: "",
    routingNumber: "",
    division: "",
    district: "",
    upazila: "",
    postOffice: "",
    postalCode: "",
    address: "",
    phone: "",
    email: "",
    managerName: "",
    notes: "",
    status: "active",
    isDemo: 0,
  });
  const [modalDistricts, setModalDistricts] = useState([]);
  const [modalUpazilas, setModalUpazilas] = useState([]);

  // Branch Details View Drawer/Modal State
  const [isBranchViewModalOpen, setIsBranchViewModalOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState(null);

  // Linked Services State
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Staff & Invitations State
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [invitationsList, setInvitationsList] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [isInviteStaffModalOpen, setIsInviteStaffModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roleName: "bank_admin",
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteResult, setInviteResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // KYC Requirements State
  const [kycRequirements, setKycRequirements] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  // Applications State
  const [applications, setApplications] = useState([]);
  const [appStats, setAppStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    underReviewApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });
  const [appsLoading, setAppsLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    sla_hours: 48,
    branch_policy: "merchant_selects_branch",
    escalation_email: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // 1. Fetch Institution Data
  const fetchInstitution = async () => {
    setLoadingInst(true);
    setErrorInst("");
    try {
      const res = await adminApi.getInstitution(institutionId);
      const data = res?.data || res?.institution || res;
      setInstitution(data);
    } catch (err) {
      setErrorInst(err?.response?.data?.message || "Failed to load institution details.");
    } finally {
      setLoadingInst(false);
    }
  };

  useEffect(() => {
    if (institutionId) {
      fetchInstitution();
      loadGeoDivisions();
    }
  }, [institutionId]);

  // Load Divisions
  const loadGeoDivisions = async () => {
    try {
      const res = await adminApi.getGeoDivisions();
      setGeoDivisions(res?.data || res || []);
    } catch (err) {
      console.error("Failed to load divisions:", err);
    }
  };

  // 2. Fetch Branches & Stats
  const fetchBranches = async (page = 1) => {
    if (!institutionId) return;
    setBranchesLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.getInstitutionBranches(institutionId, {
          search: branchSearch.trim() || undefined,
          division: selectedDivision !== "all" ? selectedDivision : undefined,
          district: selectedDistrict !== "all" ? selectedDistrict : undefined,
          upazila: selectedUpazila !== "all" ? selectedUpazila : undefined,
          status: branchStatusFilter !== "all" ? branchStatusFilter : undefined,
          demoFilter: branchDemoFilter !== "all" ? branchDemoFilter : undefined,
          includeArchived: branchIncludeArchived ? 1 : undefined,
          page,
          limit: 15,
        }),
        adminApi.getInstitutionBranchStats(institutionId).catch(() => null),
      ]);

      const items = listRes?.data || listRes?.branches || [];
      setBranches(Array.isArray(items) ? items : []);
      if (listRes?.pagination) {
        setBranchPagination(listRes.pagination);
      }

      if (statsRes?.data) {
        setBranchStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    } finally {
      setBranchesLoading(false);
    }
  };

  // Cascading filters for Branches Table
  useEffect(() => {
    if (selectedDivision !== "all") {
      adminApi.getGeoDistricts({ division: selectedDivision }).then((res) => {
        setGeoDistricts(res?.data || res || []);
      });
    } else {
      setGeoDistricts([]);
      setSelectedDistrict("all");
    }
    setSelectedDistrict("all");
    setSelectedUpazila("all");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict !== "all") {
      adminApi.getGeoUpazilas({ district: selectedDistrict }).then((res) => {
        setGeoUpazilas(res?.data || res || []);
      });
    } else {
      setGeoUpazilas([]);
      setSelectedUpazila("all");
    }
    setSelectedUpazila("all");
  }, [selectedDistrict]);

  useEffect(() => {
    if (activeTab === "branches" || activeTab === "overview") {
      fetchBranches(1);
    } else if (activeTab === "users") {
      fetchStaff();
      fetchInvitations();
    } else if (activeTab === "services") {
      fetchServices();
    } else if (activeTab === "kyc") {
      fetchKycRequirements();
    } else if (activeTab === "applications") {
      fetchApplications();
    } else if (activeTab === "settings") {
      fetchSettings();
    }
  }, [
    activeTab,
    institutionId,
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    branchStatusFilter,
    branchDemoFilter,
    branchIncludeArchived,
  ]);

  useEffect(() => {
    if (searchParams.get("invite") === "true") {
      setIsInviteStaffModalOpen(true);
    }
  }, [searchParams]);

  // Tab switcher
  const handleTabChange = (tabId) => {
    searchParams.set("tab", tabId);
    setSearchParams(searchParams);

    if (tabId === "services") fetchServices();
    if (tabId === "users") {
      fetchStaff();
      fetchInvitations();
    }
    if (tabId === "kyc") fetchKycRequirements();
    if (tabId === "applications") fetchApplications();
    if (tabId === "settings") fetchSettings();
  };

  // Additional Tabs Fetchers
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await adminApi.getInstitutionServices({ institutionId });
      setServices(res?.data || res?.services || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await adminApi.getInstitutionStaff({ institutionId });
      setStaffList(res?.data || res?.staff || []);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const res = await adminApi.getInstitutionInvitations({ institutionId });
      setInvitationsList(res?.data || res || []);
    } catch (err) {
      console.error("Failed to load invitations:", err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const fetchKycRequirements = async () => {
    setKycLoading(true);
    try {
      const res = await adminApi.getInstitutionKycRequirements({ institutionId });
      setKycRequirements(res?.data || res?.requirements || []);
    } catch (err) {
      console.error("Failed to load KYC:", err);
    } finally {
      setKycLoading(false);
    }
  };

  const fetchApplications = async () => {
    appsLoading || setAppsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.getInstitutionApplications(institutionId),
        adminApi.getInstitutionApplicationStats(institutionId).catch(() => null),
      ]);
      setApplications(listRes?.data || listRes?.applications || []);
      if (statsRes?.data) setAppStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await adminApi.getInstitutionSettings(institutionId);
      const data = res?.data?.settings || res?.settings || res?.data || {};
      const sla = data.sla_hours !== undefined ? Number(data.sla_hours) : data.kyc_review_sla_hours !== undefined ? Number(data.kyc_review_sla_hours) : 48;
      const bp = data.branch_policy || data.branch_routing_policy || "merchant_selects_branch";
      const email = data.escalation_email || data.operations_escalation_email || data.escalationEmail || "";
      setSettings({
        ...data,
        sla_hours: sla,
        branch_policy: bp === "optional" ? "merchant_selects_branch" : bp === "mandatory" ? "auto_assign_nearest_branch" : bp === "disabled" ? "manual_assignment" : bp,
        branch_routing_policy: bp === "optional" ? "merchant_selects_branch" : bp === "mandatory" ? "auto_assign_nearest_branch" : bp === "disabled" ? "manual_assignment" : bp,
        escalation_email: email,
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Handle Branch Form Modal (Add / Edit)
  const openBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setBranchModalError("");
    if (branch) {
      setBranchFormData({
        branchName: branch.branch_name || "",
        branchCode: branch.branch_code || "",
        routingNumber: branch.routing_number || "",
        division: branch.division || "",
        district: branch.district || "",
        upazila: branch.upazila || "",
        postOffice: branch.post_office || "",
        postalCode: branch.postal_code || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        managerName: branch.manager_name || "",
        notes: branch.notes || "",
        status: branch.status || "active",
        isDemo: branch.is_demo || 0,
      });
      // Load cascading dropdowns for existing values
      if (branch.division) {
        adminApi.getGeoDistricts({ division: branch.division }).then((res) => {
          setModalDistricts(res?.data || res || []);
        });
      }
      if (branch.district) {
        adminApi.getGeoUpazilas({ district: branch.district }).then((res) => {
          setModalUpazilas(res?.data || res || []);
        });
      }
    } else {
      setBranchFormData({
        branchName: "",
        branchCode: "",
        routingNumber: "",
        division: "",
        district: "",
        upazila: "",
        postOffice: "",
        postalCode: "",
        address: "",
        phone: "",
        email: "",
        managerName: "",
        notes: "",
        status: "active",
        isDemo: 0,
      });
      setModalDistricts([]);
      setModalUpazilas([]);
    }
    setIsBranchModalOpen(true);
  };

  const handleModalDivisionChange = (divName) => {
    setBranchFormData((p) => ({ ...p, division: divName, district: "", upazila: "" }));
    if (divName) {
      adminApi.getGeoDistricts({ division: divName }).then((res) => {
        setModalDistricts(res?.data || res || []);
      });
    } else {
      setModalDistricts([]);
    }
    setModalUpazilas([]);
  };

  const handleModalDistrictChange = (distName) => {
    setBranchFormData((p) => ({ ...p, district: distName, upazila: "" }));
    if (distName) {
      adminApi.getGeoUpazilas({ district: distName }).then((res) => {
        setModalUpazilas(res?.data || res || []);
      });
    } else {
      setModalUpazilas([]);
    }
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setBranchModalError("");

    if (!branchFormData.branchName.trim()) {
      setBranchModalError("Branch Name is required.");
      return;
    }
    if (!branchFormData.branchCode.trim()) {
      setBranchModalError("Branch Code is required.");
      return;
    }
    if (
      !branchFormData.routingNumber ||
      !/^\d{9}$/.test(branchFormData.routingNumber.trim())
    ) {
      setBranchModalError("Routing Number must be exactly 9 numeric digits (e.g. 060271234).");
      return;
    }
    if (!branchFormData.division) {
      setBranchModalError("Please select a Division.");
      return;
    }
    if (!branchFormData.district) {
      setBranchModalError("Please select a District.");
      return;
    }
    if (!branchFormData.upazila) {
      setBranchModalError("Please select an Upazila / Thana.");
      return;
    }

    setBranchSubmitting(true);
    try {
      const payload = {
        branchName: branchFormData.branchName.trim(),
        branchCode: branchFormData.branchCode.trim().toUpperCase(),
        routingNumber: branchFormData.routingNumber.trim(),
        division: branchFormData.division,
        district: branchFormData.district,
        upazila: branchFormData.upazila,
        postOffice: branchFormData.postOffice.trim() || null,
        postalCode: branchFormData.postalCode.trim() || null,
        address: branchFormData.address.trim() || null,
        phone: branchFormData.phone.trim() || null,
        email: branchFormData.email.trim() || null,
        managerName: branchFormData.managerName.trim() || null,
        notes: branchFormData.notes.trim() || null,
        status: branchFormData.status,
        isDemo: Number(branchFormData.isDemo) || 0,
      };

      if (editingBranch) {
        await adminApi.updateBranch(editingBranch.id, payload);
        showToast(`Branch "${payload.branchName}" updated successfully.`);
      } else {
        await adminApi.createInstitutionBranch(institutionId, payload);
        showToast(`Branch "${payload.branchName}" created successfully.`);
      }

      setIsBranchModalOpen(false);
      fetchBranches(1);
    } catch (err) {
      setBranchModalError(err?.response?.data?.message || "Failed to save branch.");
    } finally {
      setBranchSubmitting(false);
    }
  };

  // Branch View Modal
  const handleViewBranch = (branch) => {
    setViewingBranch(branch);
    setIsBranchViewModalOpen(true);
  };

  // Archive Branch
  const handleArchiveBranch = async (branch) => {
    if (
      !window.confirm(
        `Archive branch "${branch.branch_name}" (${branch.branch_code})? It will be marked inactive and hidden from active merchant KYC forms.`
      )
    )
      return;

    try {
      await adminApi.archiveBranch(branch.id);
      showToast(`Branch "${branch.branch_name}" archived successfully.`);
      fetchBranches(branchPagination.page);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to archive branch.");
    }
  };

  // Toggle Demo Status
  const handleToggleDemoBranch = async (branch) => {
    const targetState = branch.is_demo === 1 ? 0 : 1;
    const label = targetState === 1 ? "Demo record" : "Real live branch";
    if (
      !window.confirm(
        `Change branch "${branch.branch_name}" status to ${label}?`
      )
    )
      return;

    try {
      await adminApi.toggleDemoBranch(branch.id, targetState === 1);
      showToast(`Branch "${branch.branch_name}" marked as ${label}.`);
      fetchBranches(branchPagination.page);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update demo status.");
    }
  };

  // Branch Status Toggle
  const handleToggleBranchStatus = async (branch) => {
    const newStatus = branch.status === "active" ? "inactive" : "active";
    if (
      !window.confirm(
        `Are you sure you want to change branch "${branch.branch_name}" to ${newStatus}?`
      )
    )
      return;

    try {
      await adminApi.updateBranchStatus(branch.id, newStatus);
      showToast(`Branch "${branch.branch_name}" is now ${newStatus}.`);
      fetchBranches(branchPagination.page);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update branch status.");
    }
  };

  // Branch Delete
  const handleDeleteBranch = async (branch) => {
    if (
      !window.confirm(
        `Delete branch "${branch.branch_name}" (${branch.branch_code})? This action cannot be undone.`
      )
    )
      return;

    try {
      await adminApi.deleteBranch(branch.id);
      showToast(`Branch "${branch.branch_name}" deleted.`);
      fetchBranches(branchPagination.page);
    } catch (err) {
      alert(err?.response?.data?.message || "Cannot delete branch with active references.");
    }
  };

  // Invite Bank Admin / Staff Submit
  const handleInviteStaff = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteResult(null);
    setInviteSubmitting(true);
    try {
      const res = await adminApi.inviteInstitutionStaff({
        institutionId: Number(institutionId),
        name: inviteFormData.name.trim(),
        email: inviteFormData.email.trim().toLowerCase(),
        phone: inviteFormData.phone.trim() || null,
        roleName: inviteFormData.roleName,
      });
      const data = res?.data || res;
      setInviteResult(data);
      showToast(data.message || `Invitation created for ${inviteFormData.email}`);
      fetchStaff();
      fetchInvitations();
    } catch (err) {
      setInviteError(err?.response?.data?.message || "Failed to send staff invitation.");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleResendInvitation = async (inv) => {
    if (!window.confirm(`Resend invitation link to ${inv.email}?`)) return;
    try {
      const res = await adminApi.resendInstitutionInvitation(inv.id);
      showToast(res?.message || `Invitation resent to ${inv.email}`);
      fetchInvitations();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to resend invitation.");
    }
  };

  const handleRevokeInvitation = async (inv) => {
    if (!window.confirm(`Revoke pending invitation for ${inv.email}?`)) return;
    try {
      await adminApi.revokeInstitutionInvitation(inv.id);
      showToast(`Invitation for ${inv.email} revoked.`);
      fetchInvitations();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to revoke invitation.");
    }
  };

  const handleToggleStaffStatus = async (staffMember) => {
    const nextStatus = staffMember.membership_status === "active" ? "inactive" : "active";
    const actionLabel = nextStatus === "active" ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${staffMember.email}?`)) return;
    try {
      await adminApi.updateInstitutionStaff(staffMember.membership_id, {
        membershipStatus: nextStatus,
      });
      showToast(`Staff member status changed to ${nextStatus}.`);
      fetchStaff();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update staff status.");
    }
  };

  // Save Settings Submit
  const handleSaveSettings = async (e) => {
    e.preventDefault();

    const slaNum = Number(settings.sla_hours);
    if (!Number.isInteger(slaNum) || slaNum < 1 || slaNum > 720) {
      alert("KYC Review Target SLA must be a positive integer between 1 and 720 hours (max 30 days).");
      return;
    }

    if (settings.escalation_email && settings.escalation_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.escalation_email.trim())) {
      alert("Please provide a valid email format for Operations Contact / Escalation Email.");
      return;
    }

    setSettingsSaving(true);
    try {
      const payload = {
        ...settings,
        sla_hours: slaNum,
        kyc_review_sla_hours: slaNum,
        branch_policy: settings.branch_policy || "merchant_selects_branch",
        branch_routing_policy: settings.branch_policy || "merchant_selects_branch",
        escalation_email: settings.escalation_email ? settings.escalation_email.trim() : "",
      };
      await adminApi.saveInstitutionSettings(institutionId, payload);
      showToast("Institution operational settings saved successfully.");
      await fetchSettings();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loadingInst) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <RefreshCw size={28} className="animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold">Loading bank workspace...</p>
      </div>
    );
  }

  if (errorInst || !institution) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle size={40} className="mx-auto text-red-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Institution Not Found
        </h2>
        <p className="text-xs text-slate-500">{errorInst || "Unable to locate this institution."}</p>
        <Link
          to="/admin/institutions"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <ArrowLeft size={14} />
          <span>Back to All Banks</span>
        </Link>
      </div>
    );
  }

  const instCode = institution.institution_code || institution.code || "BNK";
  const instType = institution.institution_type || institution.type || "bank";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/admin/institutions" className="hover:text-emerald-600 transition flex items-center gap-1">
            <Landmark size={14} />
            <span>Bank Management</span>
          </Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{institution.name}</span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="capitalize font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {activeTab.replace(/_/g, " ")}
          </span>
        </div>

        <Link
          to="/admin/institutions"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft size={13} />
          <span>All Banks</span>
        </Link>
      </div>

      {/* Bank Identity Header Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo & Main Info */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {institution.logo_url ? (
                <img
                  src={resolveImageUrl(institution.logo_url)}
                  alt={institution.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xl font-bold font-mono text-slate-400">{instCode.slice(0, 3)}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {institution.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {instCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                  {instType.replace(/_/g, " ")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    institution.status === "active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      institution.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  <span>{institution.status || "active"}</span>
                </span>
              </div>

              {/* Contact & Links Bar */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                {institution.support_phone && (
                  <a
                    href={`tel:${institution.support_phone}`}
                    className="flex items-center gap-1 hover:text-emerald-600 transition"
                  >
                    <Phone size={13} className="text-slate-400" />
                    <span>{institution.support_phone}</span>
                  </a>
                )}
                {institution.support_email && (
                  <a
                    href={`mailto:${institution.support_email}`}
                    className="flex items-center gap-1 hover:text-emerald-600 transition"
                  >
                    <Mail size={13} className="text-slate-400" />
                    <span>{institution.support_email}</span>
                  </a>
                )}
                {institution.website_url && (
                  <a
                    href={institution.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    <Globe size={13} />
                    <span>Official Website</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setInviteFormData({
                  name: "",
                  email: "",
                  phone: "",
                  roleName: "bank_admin",
                });
                setInviteError("");
                setInviteResult(null);
                setCopiedLink(false);
                setIsInviteStaffModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
            >
              <UserPlus size={13} />
              <span>Invite Bank Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition"
            >
              <Edit2 size={13} className="text-blue-500" />
              <span>Edit Bank</span>
            </button>

            <button
              type="button"
              onClick={() => openBranchModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              <Plus size={14} />
              <span>Add Branch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (7 Dedicated Sub-workspaces) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "overview", label: "Overview", icon: Landmark },
          { id: "branches", label: `Branches & Locations (${branchStats.totalBranches})`, icon: Building },
          { id: "services", label: "Services", icon: Network },
          { id: "users", label: "Bank Staff", icon: Users },
          { id: "kyc", label: "KYC Requirements", icon: FileCheck },
          { id: "applications", label: "Merchant Applications", icon: Briefcase },
          { id: "settings", label: "Settings", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon size={14} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          {/* 8 Stats Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Total Branches</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {branchStats.totalBranches}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Active Branches</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {branchStats.activeBranches}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Divisions Covered</span>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {branchStats.divisionsCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Districts Covered</span>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {branchStats.districtsCount}
              </p>
            </div>
          </div>

          {/* Institution Profile Summary */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Institutional Profile & Regulatory Information</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit2 size={12} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Institution Code</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{instCode}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Institution Type</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {instType.replace(/_/g, " ")}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">SWIFT / BIC Code</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {institution.swift_code || institution.swiftCode || "—"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Official Bank Code</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {institution.official_bank_code || institution.officialBankCode || "—"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Bengali Name (বাংলা নাম)</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {institution.name_bn || institution.nameBn || "—"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Legal Entity Name</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {institution.legal_name || institution.legalName || "—"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Bank Category</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                  {(institution.bank_category || institution.bankCategory || "—").replace(/_/g, " ")}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Ownership Type</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                  {(institution.ownership_type || institution.ownershipType || "—").replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Regulatory Reference & Key Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Regulatory License / Reference</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">
                  {institution.regulatory_reference || institution.regulatoryReference || "—"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Official Contact Person</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>{institution.official_contact_person || institution.officialContactPerson || "—"}</span>
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-slate-400 text-[11px]">Contact Designation</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {institution.contact_designation || institution.contactDesignation || "—"}
                </p>
              </div>
            </div>

            {/* Head Office & Geographic Location */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                Head Office & Geographic Hierarchy
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                <span>
                  {institution.head_office_address || institution.headOfficeAddress || "Address not specified"}
                </span>
              </p>
              {(institution.division || institution.district || institution.upazila) && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                  {institution.upazila && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold">
                      Upazila: {institution.upazila}
                    </span>
                  )}
                  {institution.district && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold">
                      District: {institution.district}
                    </span>
                  )}
                  {institution.division && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold">
                      Division: {institution.division}
                    </span>
                  )}
                </div>
              )}
            </div>

            {institution.description && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  Overview & Description
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {institution.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BRANCHES & LOCATIONS (Target Reference Design)
          ========================================================================= */}
      {activeTab === "branches" && (
        <div className="space-y-6 animate-in fade-in">
          {/* 5 KPI Metric Cards Matching Screenshot 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Branches</span>
                <Building size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {branchStats.totalBranches}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Divisions</span>
                <MapPin size={16} className="text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {branchStats.divisionsCount}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Districts</span>
                <MapPin size={16} className="text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {branchStats.districtsCount}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Active</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {branchStats.activeBranches}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Inactive</span>
                <XCircle size={16} className="text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {branchStats.inactiveBranches}
              </p>
            </div>
          </div>

          {/* Search, Cascading Filters & Actions Bar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchBranches(1)}
                  placeholder="Search branch name, code, address, manager, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>

              {/* Actions: Export CSV & Add Branch */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={adminApi.getInstitutionBranchesExportUrl(institutionId)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                  title="Export all branches as CSV"
                >
                  <Download size={13} className="text-slate-500" />
                  <span>Export CSV</span>
                </a>

                <button
                  type="button"
                  onClick={() => openBranchModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                >
                  <Plus size={14} />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            {/* Cascading Location Filter Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter size={12} className="text-slate-400" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
              </div>

              {/* Division Dropdown */}
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Divisions</option>
                {geoDivisions.map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name} {div.name_bn ? `(${div.name_bn})` : ""}
                  </option>
                ))}
              </select>

              {/* District Dropdown */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedDivision === "all"}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="all">All Districts</option>
                {geoDistricts.map((dist) => (
                  <option key={dist.id} value={dist.name}>
                    {dist.name} {dist.name_bn ? `(${dist.name_bn})` : ""}
                  </option>
                ))}
              </select>

              {/* Upazila Dropdown */}
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                disabled={selectedDistrict === "all"}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="all">All Upazilas / Thanas</option>
                {geoUpazilas.map((up) => (
                  <option key={up.id} value={up.name}>
                    {up.name} {up.name_bn ? `(${up.name_bn})` : ""}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={branchStatusFilter}
                onChange={(e) => setBranchStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              {/* Demo Records Filter */}
              <select
                value={branchDemoFilter}
                onChange={(e) => setBranchDemoFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Records (Real & Demo)</option>
                <option value="real">Real Branches Only</option>
                <option value="demo">Demo Records Only</option>
              </select>

              {/* Show Archived Checkbox */}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none pl-1">
                <input
                  type="checkbox"
                  checked={branchIncludeArchived}
                  onChange={(e) => setBranchIncludeArchived(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">Show Archived</span>
              </label>

              {/* Reset Filters */}
              {(selectedDivision !== "all" ||
                selectedDistrict !== "all" ||
                selectedUpazila !== "all" ||
                branchStatusFilter !== "all" ||
                branchDemoFilter !== "all" ||
                branchIncludeArchived ||
                branchSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDivision("all");
                    setSelectedDistrict("all");
                    setSelectedUpazila("all");
                    setBranchStatusFilter("all");
                    setBranchDemoFilter("all");
                    setBranchIncludeArchived(false);
                    setBranchSearch("");
                  }}
                  className="text-xs text-rose-600 hover:underline px-2 py-1 font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Branches Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 w-10">#</th>
                    <th className="py-3.5 px-4">Branch Details</th>
                    <th className="py-3.5 px-3">Location Hierarchy</th>
                    <th className="py-3.5 px-3">Address & Postal</th>
                    <th className="py-3.5 px-3">Contact</th>
                    <th className="py-3.5 px-3">Manager</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {branchesLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                        <p className="text-xs">Loading branches...</p>
                      </td>
                    </tr>
                  ) : branches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Building size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          No branches found
                        </p>
                        <p className="text-xs mt-1">
                          Click "Add Branch" above to register physical branches for this bank.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    branches.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {(branchPagination.page - 1) * branchPagination.limit + idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">{b.branch_name}</span>
                            {b.is_demo === 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                                DEMO
                              </span>
                            )}
                            {b.is_archived === 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                                ARCHIVED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px] mt-0.5">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              CODE: {b.branch_code}
                            </span>
                            {b.routing_number && (
                              <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                                ROUTING: {b.routing_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <span>{b.division}</span>
                            <span className="text-slate-400">›</span>
                            <span>{b.district}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{b.upazila}</div>
                        </td>
                        <td className="py-3.5 px-3 max-w-xs">
                          <div className="truncate text-slate-700 dark:text-slate-300">
                            {b.address || "—"}
                          </div>
                          {b.postal_code && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Postal: {b.postal_code}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {b.phone ? (
                            <div className="text-slate-700 dark:text-slate-300">{b.phone}</div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {b.email && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{b.email}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                          {b.manager_name || "—"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              b.status === "active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : b.status === "suspended"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                b.status === "active"
                                  ? "bg-emerald-500"
                                  : b.status === "suspended"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span className="capitalize">{b.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => handleViewBranch(b)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition"
                              title="View Full Branch Details"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Edit Branch */}
                            <button
                              type="button"
                              onClick={() => openBranchModal(b)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                              title="Edit Branch"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Toggle Demo Status */}
                            <button
                              type="button"
                              onClick={() => handleToggleDemoBranch(b)}
                              className={`p-1.5 rounded-lg transition ${
                                b.is_demo === 1
                                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              }`}
                              title={b.is_demo === 1 ? "Convert Demo to Real Branch" : "Flag as Demo Branch"}
                            >
                              <ShieldCheck size={13} />
                            </button>

                            {/* Toggle Active Status */}
                            <button
                              type="button"
                              onClick={() => handleToggleBranchStatus(b)}
                              className={`p-1.5 rounded-lg transition ${
                                b.status === "active"
                                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={b.status === "active" ? "Deactivate Branch" : "Activate Branch"}
                            >
                              <Power size={13} />
                            </button>

                            {/* Archive Branch */}
                            <button
                              type="button"
                              onClick={() => handleArchiveBranch(b)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition"
                              title="Archive Branch"
                            >
                              <FileCheck size={13} />
                            </button>

                            {/* Delete Branch */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(b)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                              title="Delete Branch"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {branchPagination.totalPages > 1 && (
              <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(branchPagination.page - 1) * branchPagination.limit + 1} to{" "}
                  {Math.min(branchPagination.page * branchPagination.limit, branchPagination.total)} of{" "}
                  {branchPagination.total} branches
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={branchPagination.page <= 1}
                    onClick={() => fetchBranches(branchPagination.page - 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {branchPagination.page} / {branchPagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={branchPagination.page >= branchPagination.totalPages}
                    onClick={() => fetchBranches(branchPagination.page + 1)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Merchant KYC Connection Information Panel */}
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Merchant Application & Routing Linkage
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Active branches registered here will automatically be eligible for merchant selection during
                the BanglaQR Merchant Marketplace onboarding process when applying for banking services linked
                to {institution.name}. Deactivated branches will be hidden from new applicant dropdowns while
                preserving historical merchant application records intact.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SERVICES
          ========================================================================= */}
      {activeTab === "services" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Services Linked to {institution.name}
              </h3>
              <p className="text-xs text-slate-500">
                Services available in the Merchant Marketplace and onboarding catalog
              </p>
            </div>
            <Link
              to={`/admin/institutions/services?institutionId=${institutionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Network size={13} />
              <span>Manage Service Associations</span>
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            {servicesLoading ? (
              <div className="py-8 text-center text-slate-400">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Network size={28} className="mx-auto mb-2 text-slate-300" />
                <p>No services currently associated with this institution.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{svc.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{svc.code}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 capitalize">
                      {svc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BANK USERS / STAFF & INVITATIONS
          ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Section 1: Active Staff Members */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Authorized Staff Members</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    {staffList.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Active officers, KYC reviewers, and operation administrators for {institution.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchStaff();
                    fetchInvitations();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="Refresh staff and invitations"
                >
                  <RefreshCw size={13} className={staffLoading || invitationsLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInviteFormData({
                      name: "",
                      email: "",
                      phone: "",
                      roleName: "bank_admin",
                    });
                    setInviteError("");
                    setInviteResult(null);
                    setCopiedLink(false);
                    setIsInviteStaffModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                >
                  <UserPlus size={14} />
                  <span>Invite Bank Admin</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Administrator / Staff Member</th>
                      <th className="py-3 px-3">Bank Role</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Account Status</th>
                      <th className="py-3 px-3">Last Login</th>
                      <th className="py-3 px-3">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {staffLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          <Loader2 size={20} className="animate-spin inline-block mr-2 text-indigo-500" />
                          Loading staff members...
                        </td>
                      </tr>
                    ) : staffList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 space-y-2">
                          <p>No active staff accounts provisioned for this institution yet.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setInviteFormData({
                                name: "",
                                email: "",
                                phone: "",
                                roleName: "bank_admin",
                              });
                              setInviteError("");
                              setInviteResult(null);
                              setIsInviteStaffModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 transition"
                          >
                            <UserPlus size={13} />
                            <span>Send First Invitation</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      staffList.map((st) => (
                        <tr key={st.membership_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {st.staff_name || st.name || st.email}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {st.email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                              {st.role_name === "bank_admin"
                                ? "Bank Admin"
                                : st.role_name === "bank_reviewer"
                                ? "KYC Reviewer"
                                : st.role_name === "bank_operations"
                                ? "Operations"
                                : st.role_name}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {st.phone || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                st.membership_status === "active"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  st.membership_status === "active" ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              <span>{st.membership_status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {st.last_login_at ? (
                              <span title={new Date(st.last_login_at).toLocaleString()}>
                                {new Date(st.last_login_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Never</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {st.joined_at ? new Date(st.joined_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleStaffStatus(st)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                st.membership_status === "active"
                                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                              title={st.membership_status === "active" ? "Deactivate this account" : "Activate this account"}
                            >
                              <Power size={11} />
                              <span>{st.membership_status === "active" ? "Deactivate" : "Activate"}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Invitations Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound size={18} className="text-amber-500" />
                  <span>Pending & Recent Invitations</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    {invitationsList.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographically secured, single-use invitation tokens with 7-day expiry
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Invited Person</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Invitation Status</th>
                      <th className="py-3 px-3">Sent Date</th>
                      <th className="py-3 px-3">Expires At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invitationsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <Loader2 size={20} className="animate-spin inline-block mr-2 text-amber-500" />
                          Loading invitations...
                        </td>
                      </tr>
                    ) : invitationsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No pending or past invitations found.
                        </td>
                      </tr>
                    ) : (
                      invitationsList.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {inv.name || inv.email}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {inv.email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {inv.role_name || "bank_admin"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {inv.status === "pending" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <Clock size={10} />
                                <span>Pending Setup</span>
                              </span>
                            ) : inv.status === "accepted" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 size={10} />
                                <span>Accepted</span>
                              </span>
                            ) : inv.status === "revoked" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                <Ban size={10} />
                                <span>Revoked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                                <XCircle size={10} />
                                <span>Expired</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {inv.expires_at ? (
                              <span
                                className={
                                  new Date(inv.expires_at) < new Date() && inv.status === "pending"
                                    ? "text-red-500 font-semibold"
                                    : ""
                                }
                              >
                                {new Date(inv.expires_at).toLocaleDateString()}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inv.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleResendInvitation(inv)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                                  title="Resend invitation token"
                                >
                                  <RotateCcw size={11} />
                                  <span>Resend</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvitation(inv)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  title="Revoke this invitation"
                                >
                                  <Ban size={11} />
                                  <span>Revoke</span>
                                </button>
                              </div>
                            ) : inv.status === "accepted" ? (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Active Account
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: KYC REQUIREMENTS
          ========================================================================= */}
      {activeTab === "kyc" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compliance & KYC Requirements
              </h3>
              <p className="text-xs text-slate-500">
                Documents and verification items required by {institution.name}
              </p>
            </div>
            <Link
              to={`/admin/institutions/kyc-requirements?institutionId=${institutionId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <FileCheck size={14} />
              <span>Manage KYC Rules</span>
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            {kycLoading ? (
              <div className="py-8 text-center text-slate-400">Loading KYC rules...</div>
            ) : kycRequirements.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <FileCheck size={28} className="mx-auto mb-2 text-slate-300" />
                <p>No institution-specific KYC requirements configured yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {kycRequirements.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{r.name}</h4>
                      <p className="text-slate-400 font-mono text-[10px]">{r.requirement_code}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        {r.requirement_category?.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.is_mandatory ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.is_mandatory ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: MERCHANT APPLICATIONS
          ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Total Applications</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {appStats.totalApplications}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Pending Review</span>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{appStats.pendingApplications}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Under Review</span>
              <p className="text-xl font-bold text-blue-600 mt-0.5">{appStats.underReviewApplications}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Approved</span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{appStats.approvedApplications}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Rejected</span>
              <p className="text-xl font-bold text-rose-600 mt-0.5">{appStats.rejectedApplications}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Merchant Name</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Branch Route</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Loading applications...</td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No merchant applications submitted to this institution yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.application_id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{app.business_name}</div>
                          <div className="text-[10px] text-slate-400">{app.merchant_email}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{app.gateway_name}</td>
                        <td className="py-3 px-3">
                          {app.branch_name ? (
                            <span className="text-emerald-600 font-semibold">{app.branch_name}</span>
                          ) : (
                            <span className="text-slate-400">Central / Online</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-slate-100 text-slate-700">
                            {app.application_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: SETTINGS
          ========================================================================= */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-4 animate-in fade-in max-w-2xl">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders size={18} className="text-purple-600" />
              <span>Operational & Workflow Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                KYC Review Target SLA (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={settings.sla_hours !== undefined && settings.sla_hours !== null ? settings.sla_hours : 48}
                onChange={(e) => setSettings((p) => ({ ...p, sla_hours: e.target.value, kyc_review_sla_hours: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Routing Policy
              </label>
              <select
                value={
                  settings.branch_policy === "auto_assign_nearest_branch" || settings.branch_routing_policy === "auto_assign_nearest_branch" || settings.branch_policy === "mandatory"
                    ? "auto_assign_nearest_branch"
                    : settings.branch_policy === "manual_assignment" || settings.branch_routing_policy === "manual_assignment" || settings.branch_policy === "disabled"
                    ? "manual_assignment"
                    : "merchant_selects_branch"
                }
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    branch_policy: e.target.value,
                    branch_routing_policy: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="merchant_selects_branch">Optional — Merchant selects nearest branch</option>
                <option value="auto_assign_nearest_branch">Automatic — Auto-assign nearest branch by location</option>
                <option value="manual_assignment">Manual — Head office / bank reviewer assigns branch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operations Contact / Escalation Email
              </label>
              <input
                type="email"
                value={settings.escalation_email || ""}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    escalation_email: e.target.value,
                    operations_escalation_email: e.target.value,
                  }))
                }
                placeholder="ops.escalation@bank.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {settingsSaving ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          ADD / EDIT BRANCH MODAL (Target Reference Cascading Form)
          ========================================================================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Building size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingBranch ? "Edit Branch" : `Add Branch for ${institution.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register branch location, code, and local manager contact details
                </p>
              </div>
            </div>

            {branchModalError && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={15} className="shrink-0" />
                <span>{branchModalError}</span>
              </div>
            )}

            <form onSubmit={handleBranchSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={branchFormData.branchName}
                  onChange={(e) => setBranchFormData((p) => ({ ...p, branchName: e.target.value }))}
                  placeholder="e.g. Gulshan Corporate Branch"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchFormData.branchCode}
                    onChange={(e) =>
                      setBranchFormData((p) => ({
                        ...p,
                        branchCode: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                      }))
                    }
                    placeholder="e.g. BRAC_001"
                    required
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Routing Number (9 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    value={branchFormData.routingNumber}
                    onChange={(e) =>
                      setBranchFormData((p) => ({
                        ...p,
                        routingNumber: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="e.g. 060271234"
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Must be exactly 9 numeric digits
                  </span>
                </div>
              </div>

              {/* Cascading Bangladesh Locations */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Bangladesh Geographic Hierarchy *
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Division *
                    </label>
                    <select
                      value={branchFormData.division}
                      onChange={(e) => handleModalDivisionChange(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Division --</option>
                      {geoDivisions.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} {d.name_bn ? `(${d.name_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      District *
                    </label>
                    <select
                      value={branchFormData.district}
                      onChange={(e) => handleModalDistrictChange(e.target.value)}
                      disabled={!branchFormData.division}
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- District --</option>
                      {modalDistricts.map((dst) => (
                        <option key={dst.id} value={dst.name}>
                          {dst.name} {dst.name_bn ? `(${dst.name_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Upazila / Thana *
                    </label>
                    <select
                      value={branchFormData.upazila}
                      onChange={(e) => setBranchFormData((p) => ({ ...p, upazila: e.target.value }))}
                      disabled={!branchFormData.district}
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Upazila --</option>
                      {modalUpazilas.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} {u.name_bn ? `(${u.name_bn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Post Office
                    </label>
                    <input
                      type="text"
                      value={branchFormData.postOffice}
                      onChange={(e) => setBranchFormData((p) => ({ ...p, postOffice: e.target.value }))}
                      placeholder="e.g. Gulshan-1"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={branchFormData.postalCode}
                      onChange={(e) => setBranchFormData((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="e.g. 1212"
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Street Address
                </label>
                <textarea
                  rows={2}
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Plot number, holding, avenue, and landmark..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Phone
                  </label>
                  <input
                    type="text"
                    value={branchFormData.phone}
                    onChange={(e) => setBranchFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+8802222288111"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={branchFormData.email}
                    onChange={(e) => setBranchFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="branch@bank.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Manager Name
                  </label>
                  <input
                    type="text"
                    value={branchFormData.managerName}
                    onChange={(e) => setBranchFormData((p) => ({ ...p, managerName: e.target.value }))}
                    placeholder="Manager In-Charge"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={branchFormData.status}
                    onChange={(e) => setBranchFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Demo Status Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Number(branchFormData.isDemo) === 1}
                    onChange={(e) =>
                      setBranchFormData((p) => ({ ...p, isDemo: e.target.checked ? 1 : 0 }))
                    }
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Flag as Demo Record (For development / sandbox testing only)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  disabled={branchSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={branchSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {branchSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving Branch...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingBranch ? "Update Branch" : "Create Branch"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BRANCH DETAILS VIEW MODAL (Target Reference Inspection Dialog)
          ========================================================================= */}
      {isBranchViewModalOpen && viewingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewingBranch.branch_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      CODE: {viewingBranch.branch_code}
                    </span>
                    {viewingBranch.is_demo === 1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300">
                        DEMO
                      </span>
                    )}
                    {viewingBranch.is_archived === 1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300">
                        ARCHIVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchViewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Institution and Routing */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Institution</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {institution?.name || viewingBranch.institution_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">9-Digit Routing Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 inline-block mt-0.5">
                    {viewingBranch.routing_number || "Not Assigned"}
                  </span>
                </div>
              </div>

              {/* Geographic Hierarchy */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
                  Bangladesh Location Hierarchy
                </span>
                <div className="grid grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Division</span>
                    <span className="font-semibold">{viewingBranch.division || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">District</span>
                    <span className="font-semibold">{viewingBranch.district || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Upazila / Thana</span>
                    <span className="font-semibold">{viewingBranch.upazila || "—"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Post Office</span>
                    <span>{viewingBranch.post_office || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Postal Code</span>
                    <span className="font-mono">{viewingBranch.postal_code || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-medium">Full Physical Address</span>
                <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {viewingBranch.address || "No detailed address registered."}
                </span>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Branch Phone</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {viewingBranch.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Branch Email</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                    {viewingBranch.email || "—"}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-medium">Branch Manager In-Charge</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {viewingBranch.manager_name || "—"}
                  </span>
                </div>
              </div>

              {/* Status and Metadata */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 block text-[10px]">Operational Status</span>
                  <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                    {viewingBranch.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Record Type</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {viewingBranch.is_demo === 1 ? "Demo Record" : "Live Production Branch"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsBranchViewModalOpen(false);
                  openBranchModal(viewingBranch);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
              >
                Edit This Branch
              </button>
              <button
                type="button"
                onClick={() => setIsBranchViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Bank Admin Modal */}
      {isInviteStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invite Bank Administrator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provision bank staff through a cryptographically secure, single-use invitation
                </p>
              </div>
            </div>

            {inviteError && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={15} className="shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {!inviteResult ? (
              <form onSubmit={handleInviteStaff} className="space-y-4">
                {/* Bank Name (Read-Only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank / Financial Institution (Read-Only)
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <Building size={14} className="text-slate-400 shrink-0" />
                    <span className="font-semibold">{institution.name}</span>
                    <span className="ml-auto font-mono text-[11px] text-slate-400">
                      [{institution.institution_code}]
                    </span>
                  </div>
                </div>

                {/* Administrator Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Administrator Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteFormData.name}
                    onChange={(e) => setInviteFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Mohammad Rahim"
                    required
                    minLength={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Login Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Login Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="e.g. rahim.bank@example.com"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    The single-use activation link will be delivered to this email.
                  </p>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={inviteFormData.phone}
                    onChange={(e) => setInviteFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. +8801700000000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteFormData.roleName}
                    onChange={(e) => setInviteFormData((p) => ({ ...p, roleName: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="bank_admin">Bank Admin (Full Bank Management)</option>
                    <option value="bank_reviewer">Bank Reviewer (KYC Reviews & Approvals)</option>
                    <option value="bank_operations">Bank Operations (Daily Transactions & Support)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bank roles are isolated strictly within this institution and have zero platform admin access.
                  </p>
                </div>

                <div className="p-3 text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Security & Password Setup</span>
                  </div>
                  <div>
                    The invitee will receive a secure token valid for 7 days to create and confirm their password. No plaintext password is ever stored or transmitted.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInviteStaffModalOpen(false)}
                    disabled={inviteSubmitting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition"
                  >
                    {inviteSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Invitation...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success / Result View */
              <div className="space-y-4">
                {inviteResult.emailDelivered ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Invitation Email Dispatched</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      An invitation email was sent to <strong>{inviteFormData.email}</strong> with secure activation instructions.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertCircle size={16} className="text-amber-600" />
                      <span>Invitation Created (SMTP Delivery Pending)</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {inviteResult.emailMessage || "SMTP server is offline or unconfigured. You can manually copy the activation link below and share it directly with the administrator."}
                    </p>
                  </div>
                )}

                {/* Activation URL Copy Box */}
                {inviteResult.invitationUrl && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Single-Use Activation Link (7-Day Expiry)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={inviteResult.invitationUrl}
                        className="w-full px-3 py-2 font-mono text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteResult.invitationUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition"
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteStaffModalOpen(false);
                      setInviteResult(null);
                      setInviteFormData({
                        name: "",
                        email: "",
                        phone: "",
                        roleName: "bank_admin",
                      });
                    }}
                    className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Bank Modal */}
      {isEditModalOpen && (
        <BankFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            fetchInstitution();
            showToast("Institution updated successfully.");
          }}
          initialData={institution}
        />
      )}
    </div>
  );
}

