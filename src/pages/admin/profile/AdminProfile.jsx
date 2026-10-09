import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { useAuth } from "../../../context/AuthContext";

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await adminApi.getProfile();
        if (res?.data?.profile) {
          setProfile(res.data.profile);
        } else if (user) {
          setProfile({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "admin",
          });
        }
      } catch (err) {
        if (user) {
          setProfile({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || "admin",
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setErrorMsg("");
    try {
      await adminApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
      });
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    setSavingPassword(true);
    setPasswordMsg("");
    setErrorMsg("");
    try {
      await adminApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="text-emerald-600" />
          Admin Profile & Security
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your administrative credentials, active sessions, and password security.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Profile Info Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" /> Account Identity
        </h2>

        {profileMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={profile.email || ""}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+880 1700-000000"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Assigned Role
              </label>
              <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                {profile.role?.replace("_", " ") || "Admin Staff"}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2"
            >
              {savingProfile && <RefreshCw size={14} className="animate-spin" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Key size={16} className="text-emerald-600" /> Change Security Password
        </h2>

        {passwordMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2"
            >
              {savingPassword && <RefreshCw size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

