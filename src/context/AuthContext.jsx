import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  import { authApi } from "../services/authApi";
  
  const AuthContext = createContext(null);
  
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const loadUser = useCallback(async () => {
      try {
        const response = await authApi.me();
  
        setUser(response.data.user);
      } catch (err) {
        if (err?.response?.status === 401) {
          try {
            localStorage.removeItem("bq_access_token");
          } catch (_) {}
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      loadUser();
    }, [loadUser]);
  
    async function login(credentials) {
      const response = await authApi.login(credentials);
      const token = response.data?.token || response.data?.accessToken;
      if (token) {
        try {
          localStorage.setItem("bq_access_token", token);
        } catch (_) {}
      }
  
      setUser(response.data.user);
  
      return response;
    }
  
    async function logout() {
      try {
        await authApi.logout();
      } finally {
        try {
          localStorage.removeItem("bq_access_token");
        } catch (_) {}
        setUser(null);
      }
    }
  
    return (
      <AuthContext.Provider
        value={{
          user,
          loading,
          isAuthenticated: Boolean(user),
          login,
          logout,
          refreshUser: loadUser,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider"
      );
    }
  
    return context;
  }