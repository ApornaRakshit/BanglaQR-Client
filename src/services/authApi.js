import api from "./api";

export const authApi = {
  register: async (payload) => {
    const { data } = await api.post(
      "/auth/register",
      payload
    );

    return data;
  },

  verify: async (payload) => {
    const { data } = await api.post(
      "/auth/verify",
      payload
    );

    return data;
  },

  resendOtp: async (payload) => {
    const { data } = await api.post(
      "/auth/resend-otp",
      payload
    );

    return data;
  },

  getVerificationStatus: async (destination) => {
    const { data } = await api.get("/auth/verification-status", {
      params: { destination },
    });

    return data;
  },

  login: async (payload) => {
    const { data } = await api.post(
      "/auth/login",
      payload
    );

    return data;
  },

  forgotPassword: async (payload) => {
    const { data } = await api.post(
      "/auth/forgot-password",
      payload
    );

    return data;
  },

  verifyResetToken: async (token) => {
    const { data } = await api.get(
      "/auth/verify-reset-token",
      { params: { token } }
    );

    return data;
  },

  resetPassword: async (payload) => {
    const { data } = await api.post(
      "/auth/reset-password",
      payload
    );

    return data;
  },

  me: async () => {
    const { data } = await api.get(
      "/auth/me"
    );

    return data;
  },

  logout: async () => {
    const { data } = await api.post(
      "/auth/logout"
    );

    return data;
  },

  verifyInstitutionInvitation: async (token) => {
    const { data } = await api.get("/auth/institution-invitations/verify", {
      params: { token },
    });
    return data;
  },

  acceptInstitutionInvitation: async (payload) => {
    const { data } = await api.post(
      "/auth/institution-invitations/accept",
      payload
    );
    return data;
  },

  changePassword: async (payload) => {
    const { data } = await api.post(
      "/auth/change-password",
      payload
    );
    return data;
  },
};