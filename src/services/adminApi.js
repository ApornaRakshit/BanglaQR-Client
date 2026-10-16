import api from "./api";

export const adminApi = {
  // 1. Dashboard
  getDashboard: (params) =>
    api.get("/admin/dashboard", { params }).then((res) => res.data),

  // 2. Merchants
  getMerchants: (params) =>
    api.get("/admin/merchants", { params }).then((res) => res.data),
  getMerchant: (merchantId) =>
    api.get(`/admin/merchants/${merchantId}`).then((res) => res.data),
  getMerchantHistory: (merchantId) =>
    api.get(`/admin/merchants/${merchantId}/history`).then((res) => res.data),
  reviewMerchant: (merchantId, data) =>
    api.post(`/admin/merchants/${merchantId}/review`, data).then((res) => res.data),

  // 3. KYC
  getKycList: (params) =>
    api.get("/admin/kyc", { params }).then((res) => res.data),
  getKycDetails: (merchantId) =>
    api.get(`/admin/kyc/${merchantId}`).then((res) => res.data),
  reviewKyc: (merchantId, data) =>
    api.post(`/admin/kyc/${merchantId}/review`, data).then((res) => res.data),

  // 4. Documents
  getDocuments: (params) =>
    api.get("/admin/documents", { params }).then((res) => res.data),
  getDocumentViewUrl: (merchantId, documentId) => {
    const base =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000/api/v1"
        : "https://api.banglaqr.online/api/v1");
    const token = typeof window !== "undefined" ? localStorage.getItem("bq_access_token") : "";
    return `${base}/admin/merchants/${merchantId}/documents/${documentId}/view${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },
  getDocumentBlob: (merchantId, documentId) =>
    api.get(`/admin/merchants/${merchantId}/documents/${documentId}/view`, {
      responseType: "blob",
    }),
  reviewDocument: (merchantId, documentId, data) =>
    api.patch(`/admin/merchants/${merchantId}/documents/${documentId}/review`, data).then((res) => res.data),

  // 5. Gateways
  getGateways: (params) =>
    api.get("/admin/gateways", { params }).then((res) => res.data),
  getGatewayStats: () =>
    api.get("/admin/gateways/stats").then((res) => res.data),
  getGateway: (gatewayId) =>
    api.get(`/admin/gateways/${gatewayId}`).then((res) => res.data),
  createGateway: (data) =>
    api.post("/admin/gateways", data).then((res) => res.data),
  updateGateway: (gatewayId, data) =>
    api.put(`/admin/gateways/${gatewayId}`, data).then((res) => res.data),
  updateGatewayStatus: (gatewayId, data) =>
    api.patch(`/admin/gateways/${gatewayId}/status`, data).then((res) => res.data),
  updateGatewayPublish: (gatewayId, data) =>
    api.patch(`/admin/gateways/${gatewayId}/publish`, data).then((res) => res.data),
  deleteGateway: (gatewayId) =>
    api.delete(`/admin/gateways/${gatewayId}`).then((res) => res.data),
  getGatewayApplications: (params) =>
    api.get("/admin/gateways/applications", { params }).then((res) => res.data),
  reviewGatewayApplication: (applicationId, data) =>
    api.post(`/admin/gateways/applications/${applicationId}/review`, data).then((res) => res.data),
  getGatewayServices: (params) =>
    api.get("/admin/gateways/services", { params }).then((res) => res.data),
  updateGatewayServiceStatus: (serviceId, data) =>
    api.patch(`/admin/gateways/services/${serviceId}/status`, data).then((res) => res.data),

  // 5.1 Institutions / Bank Management
  getInstitutionsDashboard: () =>
    api.get("/admin/institutions/dashboard").then((res) => res.data),
  getInstitutionStats: () =>
    api.get("/admin/institutions/dashboard").then((res) => res.data),
  getInstitutions: (params) =>
    api.get("/admin/institutions", { params }).then((res) => res.data),
  getBankOptions: (params) =>
    api.get("/admin/institutions/bank-options", { params }).then((res) => res.data),
  getInstitution: (id) =>
    api.get(`/admin/institutions/${id}`).then((res) => res.data),
  createInstitution: (data) =>
    api.post("/admin/institutions", data).then((res) => res.data),
  registerInstitution: (id, data) =>
    api.post(`/admin/institutions/${id}/register`, data).then((res) => res.data),
  updateInstitution: (id, data) =>
    api.put(`/admin/institutions/${id}`, data).then((res) => res.data),
  updateInstitutionStatus: (id, data) =>
    api
      .patch(
        `/admin/institutions/${id}/status`,
        typeof data === "object" && data !== null ? data : { status: data }
      )
      .then((res) => res.data),
  deleteInstitution: (id) =>
    api.delete(`/admin/institutions/${id}`).then((res) => res.data),
  uploadInstitutionLogo: (formData) =>
    api.post("/admin/institutions/upload-logo", formData).then((res) => res.data),

  // Institution Services
  getInstitutionServices: (params) =>
    api.get("/admin/institutions/services", { params }).then((res) => res.data),
  getInstitutionServiceById: (gatewayId) =>
    api.get(`/admin/institutions/services/${gatewayId}`).then((res) => res.data),
  createInstitutionService: (data) =>
    api.post("/admin/institutions/services", data).then((res) => res.data),
  updateInstitutionService: (gatewayId, data) =>
    api.put(`/admin/institutions/services/${gatewayId}`, data).then((res) => res.data),
  testInstitutionServiceConnection: (gatewayId) =>
    api.post(`/admin/institutions/services/${gatewayId}/test-connection`).then((res) => res.data),
  associateInstitutionService: (gatewayId, data) =>
    api.post(`/admin/institutions/services/${gatewayId}/associate`, typeof data === "object" ? data : { institutionId: data }).then((res) => res.data),
  disassociateInstitutionService: (gatewayId) =>
    api.post(`/admin/institutions/services/${gatewayId}/disassociate`).then((res) => res.data),

  // Institution Users / Staff
  getInstitutionStaff: (params) =>
    api.get("/admin/institutions/users", { params }).then((res) => res.data),
  getInstitutionUsers: (params) =>
    api.get("/admin/institutions/users", { params }).then((res) => res.data),
  provisionInstitutionStaff: (data) =>
    api.post("/admin/institutions/users", data).then((res) => res.data),
  provisionInstitutionUser: (data) =>
    api.post("/admin/institutions/users", data).then((res) => res.data),
  updateInstitutionStaff: (membershipId, data) =>
    api.patch(`/admin/institutions/users/${membershipId}`, data).then((res) => res.data),
  updateInstitutionUserStatus: (membershipId, data) =>
    api.patch(`/admin/institutions/users/${membershipId}`, data).then((res) => res.data),

  // Institution Invitations
  getInstitutionInvitations: (params) =>
    api.get("/admin/institutions/invitations", { params }).then((res) => res.data),
  inviteInstitutionStaff: (data) =>
    api.post("/admin/institutions/invitations", data).then((res) => res.data),
  resendInstitutionInvitation: (id) =>
    api.post(`/admin/institutions/invitations/${id}/resend`).then((res) => res.data),
  revokeInstitutionInvitation: (id) =>
    api.post(`/admin/institutions/invitations/${id}/revoke`).then((res) => res.data),

  // Institution KYC Requirements
  getInstitutionKycRequirements: (params) =>
    api.get("/admin/institutions/kyc-requirements", { params }).then((res) => res.data),
  getInstitutionKycRequirementById: (id) =>
    api.get(`/admin/institutions/kyc-requirements/${id}`).then((res) => res.data),
  getRelatedInstitutionKycRequirements: (params) =>
    api.get("/admin/institutions/kyc-requirements/related", { params }).then((res) => res.data),
  createInstitutionKycRequirement: (data) =>
    api.post("/admin/institutions/kyc-requirements", data).then((res) => res.data),
  updateInstitutionKycRequirement: (id, data) =>
    api.patch(`/admin/institutions/kyc-requirements/${id}`, data).then((res) => res.data),
  deleteInstitutionKycRequirement: (id) =>
    api.delete(`/admin/institutions/kyc-requirements/${id}`).then((res) => res.data),
  uploadKycSampleDocument: (formData) =>
    api
      .post("/admin/institutions/kyc-requirements/sample-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),

  // Institution Settings
  getInstitutionSettings: (institutionId) =>
    api.get(`/admin/institutions/${institutionId}/settings`).then((res) => res.data),
  saveInstitutionSettings: (institutionId, data) =>
    api.put(`/admin/institutions/${institutionId}/settings`, data).then((res) => res.data),
  updateInstitutionSettings: (institutionId, data) =>
    api.put(`/admin/institutions/${institutionId}/settings`, data).then((res) => res.data),

  // Institution Branches & Locations
  getInstitutionBranches: (institutionId, params) =>
    api.get(`/admin/institutions/${institutionId}/branches`, { params }).then((res) => res.data),
  getInstitutionBranchStats: (institutionId) =>
    api.get(`/admin/institutions/${institutionId}/branches/stats`).then((res) => res.data),
  createInstitutionBranch: (institutionId, data) =>
    api.post(`/admin/institutions/${institutionId}/branches`, data).then((res) => res.data),
  getBranch: (branchId) =>
    api.get(`/admin/institutions/branches/${branchId}`).then((res) => res.data),
  updateBranch: (branchId, data) =>
    api.put(`/admin/institutions/branches/${branchId}`, data).then((res) => res.data),
  updateBranchStatus: (branchId, status) =>
    api.patch(`/admin/institutions/branches/${branchId}/status`, { status }).then((res) => res.data),
  archiveBranch: (branchId) =>
    api.patch(`/admin/institutions/branches/${branchId}/archive`).then((res) => res.data),
  toggleDemoBranch: (branchId, isDemo) =>
    api.patch(`/admin/institutions/branches/${branchId}/demo`, { isDemo }).then((res) => res.data),
  deleteBranch: (branchId) =>
    api.delete(`/admin/institutions/branches/${branchId}`).then((res) => res.data),
  getInstitutionBranchesExportUrl: (institutionId) =>
    `/api/v1/admin/institutions/${institutionId}/branches/export.csv`,

  // Bangladesh Geographic Master Data
  getGeoDivisions: () =>
    api.get("/admin/institutions/geo/divisions").then((res) => res.data),
  getGeoDistricts: (params) =>
    api.get("/admin/institutions/geo/districts", { params }).then((res) => res.data),
  getGeoUpazilas: (params) =>
    api.get("/admin/institutions/geo/upazilas", { params }).then((res) => res.data),

  // Institution Merchant Applications
  getInstitutionApplications: (institutionId, params) =>
    api.get(`/admin/institutions/${institutionId}/applications`, { params }).then((res) => res.data),
  getInstitutionApplicationStats: (institutionId) =>
    api.get(`/admin/institutions/${institutionId}/applications/stats`).then((res) => res.data),

  // Bank & MFS Profiles & Directory Verification
  getInstitutionBankProfile: (institutionId) =>
    api.get(`/admin/institutions/${institutionId}/bank-profile`).then((res) => res.data),
  saveInstitutionBankProfile: (institutionId, data) =>
    api.put(`/admin/institutions/${institutionId}/bank-profile`, data).then((res) => res.data),
  getInstitutionMfsProfile: (institutionId) =>
    api.get(`/admin/institutions/${institutionId}/mfs-profile`).then((res) => res.data),
  saveInstitutionMfsProfile: (institutionId, data) =>
    api.put(`/admin/institutions/${institutionId}/mfs-profile`, data).then((res) => res.data),
  updateInstitutionDirectoryVerification: (institutionId, data) =>
    api.patch(`/admin/institutions/${institutionId}/directory-verification`, data).then((res) => res.data),

  // Staged Data Imports
  listInstitutionDataImports: () =>
    api.get("/admin/institutions/imports/all").then((res) => res.data),
  stageInstitutionDataImport: (data) =>
    api.post("/admin/institutions/imports/stage", data).then((res) => res.data),
  getInstitutionDataImportDetails: (id) =>
    api.get(`/admin/institutions/imports/${id}`).then((res) => res.data),
  publishInstitutionDataImport: (id) =>
    api.post(`/admin/institutions/imports/${id}/publish`).then((res) => res.data),

  // MFS Service Points
  listServicePoints: (params) =>
    api.get("/admin/institutions/service-points/all", { params }).then((res) => res.data),
  createServicePoint: (data) =>
    api.post("/admin/institutions/service-points", data).then((res) => res.data),

  // Partner Onboarding Applications
  listPartnerOnboardingApplications: (params) =>
    api.get("/admin/institutions/partner-applications/all", { params }).then((res) => res.data),
  reviewPartnerOnboardingApplication: (id, data) =>
    api.patch(`/admin/institutions/partner-applications/${id}/review`, data).then((res) => res.data),


  // 6. Addons
  getAddons: (params) =>
    api.get("/admin/addons", { params }).then((res) => res.data),
  getAddonStats: () =>
    api.get("/admin/addons/stats").then((res) => res.data),
  getAddon: (addonId) =>
    api.get(`/admin/addons/${addonId}`).then((res) => res.data),
  createAddon: (data) =>
    api.post("/admin/addons", data).then((res) => res.data),
  updateAddon: (addonId, data) =>
    api.put(`/admin/addons/${addonId}`, data).then((res) => res.data),
  updateAddonStatus: (addonId, data) =>
    api.patch(`/admin/addons/${addonId}/status`, data).then((res) => res.data),
  updateAddonPublish: (addonId, data) =>
    api.patch(`/admin/addons/${addonId}/publish`, data).then((res) => res.data),
  deleteAddon: (addonId) =>
    api.delete(`/admin/addons/${addonId}`).then((res) => res.data),
  getAddonApplications: (params) =>
    api.get("/admin/addons/applications", { params }).then((res) => res.data),
  reviewAddonApplication: (applicationId, data) =>
    api.post(`/admin/addons/applications/${applicationId}/review`, data).then((res) => res.data),
  getAddonOrders: (params) =>
    api.get("/admin/addon-orders", { params }).then((res) => res.data),
  getAddonOrderById: (orderId) =>
    api.get(`/admin/addon-orders/${orderId}`).then((res) => res.data),
  reviewAddonOrder: (orderId, data) =>
    api.post(`/admin/addon-orders/${orderId}/review`, data).then((res) => res.data),
  archiveAddonOrder: (orderId, data) =>
    api.patch(`/admin/addon-orders/${orderId}/archive`, data).then((res) => res.data),
  getAddonPayments: (params) =>
    api.get("/admin/addon-payments", { params }).then((res) => res.data),
  getAddonPaymentById: (paymentId) =>
    api.get(`/admin/addon-payments/${paymentId}`).then((res) => res.data),
  reconcileAddonPayment: (paymentId) =>
    api.post(`/admin/addon-payments/${paymentId}/reconcile`).then((res) => res.data),
  archiveAddonPayment: (paymentId) =>
    api.patch(`/admin/addon-payments/${paymentId}/archive`).then((res) => res.data),

  // Aliases for orders & payments
  getOrders: (params) =>
    api.get("/admin/addon-orders", { params }).then((res) => res.data),
  getOrderById: (orderId) =>
    api.get(`/admin/addon-orders/${orderId}`).then((res) => res.data),
  getPayments: (params) =>
    api.get("/admin/addon-payments", { params }).then((res) => res.data),
  getPaymentById: (paymentId) =>
    api.get(`/admin/addon-payments/${paymentId}`).then((res) => res.data),

  // 8. Support
  getTickets: (params) =>
    api.get("/admin/support", { params }).then((res) => res.data),
  getTicket: (ticketId) =>
    api.get(`/admin/support/${ticketId}`).then((res) => res.data),
  replyTicket: (ticketId, data) =>
    api.post(`/admin/support/${ticketId}/reply`, data).then((res) => res.data),
  updateTicketStatus: (ticketId, data) =>
    api.patch(`/admin/support/${ticketId}/status`, data).then((res) => res.data),

  // 9. Notifications
  getNotifications: (params) =>
    api.get("/admin/notifications", { params }).then((res) => res.data),
  getUnreadNotificationCount: () =>
    api.get("/admin/notifications/unread-count").then((res) => res.data),
  markNotificationRead: (notifId) =>
    api.patch(`/admin/notifications/${notifId}/read`).then((res) => res.data),
  markAllNotificationsRead: () =>
    api.patch("/admin/notifications/read-all").then((res) => res.data),
  broadcastNotification: (data) =>
    api.post("/admin/notifications/broadcast", data).then((res) => res.data),
  deleteNotification: (notifId) =>
    api.delete(`/admin/notifications/${notifId}`).then((res) => res.data),

  // 10. Audit Logs
  getAuditLogs: (params) =>
    api.get("/admin/audit", { params }).then((res) => res.data),

  // 11. Settings
  getSettings: () =>
    api.get("/admin/settings").then((res) => res.data),
  updateSetting: (key, data) =>
    api.put(`/admin/settings/${key}`, data).then((res) => res.data),

  // 12. Profile & Security
  getProfile: () =>
    api.get("/admin/profile").then((res) => res.data),
  updateProfile: (data) =>
    api.put("/admin/profile", data).then((res) => res.data),
  changePassword: (data) =>
    api.put("/admin/profile/password", data).then((res) => res.data),

  // 13. CMS (Content Management System)
  getCmsHomepage: () =>
    api.get("/admin/cms/homepage").then((res) => res.data),
  saveCmsDraft: (data) =>
    api.put("/admin/cms/homepage", data).then((res) => res.data),
  publishCmsDraft: (data) =>
    api.post("/admin/cms/homepage/publish", data).then((res) => res.data),
  uploadCmsMedia: (formData) =>
    api
      .post("/admin/cms/upload", formData, {
        headers: { "Content-Type": undefined },
      })
      .then((res) => res.data),
  getPublicCmsHomepage: () =>
    api.get("/public/cms/homepage").then((res) => res.data),

  // 14. Contact Inquiries
  getContactInquiries: (params) =>
    api.get("/admin/contact-inquiries", { params }).then((res) => res.data),
  getContactInquiry: (id) =>
    api.get(`/admin/contact-inquiries/${id}`).then((res) => res.data),
  updateContactInquiryStatus: (id, data) =>
    api.patch(`/admin/contact-inquiries/${id}/status`, data).then((res) => res.data),
  deleteContactInquiry: (id) =>
    api.delete(`/admin/contact-inquiries/${id}`).then((res) => res.data),
};
