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
  getDocumentViewUrl: (merchantId, documentId) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/admin/merchants/${merchantId}/documents/${documentId}/view`,
  reviewDocument: (merchantId, documentId, data) =>
    api.patch(`/admin/merchants/${merchantId}/documents/${documentId}/review`, data).then((res) => res.data),

  // 5. Gateways
  getGateways: () =>
    api.get("/admin/gateways").then((res) => res.data),
  getGateway: (gatewayId) =>
    api.get(`/admin/gateways/${gatewayId}`).then((res) => res.data),
  createGateway: (data) =>
    api.post("/admin/gateways", data).then((res) => res.data),
  updateGateway: (gatewayId, data) =>
    api.put(`/admin/gateways/${gatewayId}`, data).then((res) => res.data),
  deleteGateway: (gatewayId) =>
    api.delete(`/admin/gateways/${gatewayId}`).then((res) => res.data),
  getGatewayApplications: (params) =>
    api.get("/admin/gateways/applications", { params }).then((res) => res.data),
  getGatewayServices: (params) =>
    api.get("/admin/gateways/services", { params }).then((res) => res.data),

  // 6. Addons
  getAddons: () =>
    api.get("/admin/addons").then((res) => res.data),
  getAddon: (addonId) =>
    api.get(`/admin/addons/${addonId}`).then((res) => res.data),
  createAddon: (data) =>
    api.post("/admin/addons", data).then((res) => res.data),
  updateAddon: (addonId, data) =>
    api.put(`/admin/addons/${addonId}`, data).then((res) => res.data),
  deleteAddon: (addonId) =>
    api.delete(`/admin/addons/${addonId}`).then((res) => res.data),

  // 7. Invoices
  getInvoices: (params) =>
    api.get("/admin/invoices", { params }).then((res) => res.data),
  getInvoice: (invoiceId) =>
    api.get(`/admin/invoices/${invoiceId}`).then((res) => res.data),
  updateInvoiceStatus: (invoiceId, data) =>
    api.patch(`/admin/invoices/${invoiceId}/status`, data).then((res) => res.data),

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
  getNotifications: () =>
    api.get("/admin/notifications").then((res) => res.data),
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
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),
  getPublicCmsHomepage: () =>
    api.get("/public/cms/homepage").then((res) => res.data),
};
