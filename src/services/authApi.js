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

  login: async (payload) => {
    const { data } = await api.post(
      "/auth/login",
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
};