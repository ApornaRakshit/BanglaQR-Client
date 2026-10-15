import api from "./api";

export const institutionApi = {
  // Me & Institution Profile
  getMe: () => api.get("/institution/me").then((res) => res.data),

  // Dashboard Overview
  getDashboard: () => api.get("/institution/dashboard").then((res) => res.data),

  // Merchant Applications & KYC Correction
  getApplications: (params) =>
    api.get("/institution/applications", { params }).then((res) => res.data),
  getApplication: (id) =>
    api.get(`/institution/applications/${id}`).then((res) => res.data),
  requestCorrection: (id, data) =>
    api.post(`/institution/applications/${id}/correction`, data).then((res) => res.data),
  resolveCorrection: (issueId, data) =>
    api.patch(`/institution/applications/corrections/${issueId}/resolve`, data).then((res) => res.data),
  reviewApplication: (id, data) =>
    api.post(`/institution/applications/${id}/review`, data).then((res) => res.data),

  // Branches & Official Update Requests
  getBranches: (params) =>
    api.get("/institution/branches", { params }).then((res) => res.data),
  createBranchChangeRequest: (data) =>
    api.post("/institution/branches/change-request", data).then((res) => res.data),

  // Staff & Branch Assignments
  getStaff: () => api.get("/institution/staff").then((res) => res.data),
  assignStaffBranches: (membershipId, data) =>
    api.post(`/institution/staff/${membershipId}/branches`, data).then((res) => res.data),

  // Services
  getServices: () => api.get("/institution/services").then((res) => res.data),
  saveService: (data) => api.post("/institution/services", data).then((res) => res.data),

  // Connections & Verification
  getConnections: () => api.get("/institution/connections").then((res) => res.data),
  testConnection: (serviceId) =>
    api.post(`/institution/connections/${serviceId}/test`).then((res) => res.data),

  // Reports
  getReports: () => api.get("/institution/reports").then((res) => res.data),
};

export default institutionApi;

