import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Settings,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";
import { useAuth } from "../../../context/AuthContext";

export default function AccountSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await merchantApi.getMe();
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErr("New password and confirm password do not match");
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordErr(null);
      setPasswordMsg(null);

      await merchantApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMsg("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordErr(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your account security, password, and registered business profile
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-600" />
          Business Profile Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Registered Business Name</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.business_name || profile?.company_name || user?.name || "BanglaQR Merchant"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Primary Email</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.email || user?.email || "—"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Contact Phone</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {profile?.phone || user?.phone || "—"}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block">Account Role</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block capitalize">
              {user?.role || "Merchant"}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/merchant/onboarding/company"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Edit Company & Contact Information →
          </Link>
        </div>
      </div>

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-600" />
          Change Password
        </h2>

        {passwordMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {passwordMsg}
          </div>
        )}

        {passwordErr && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            {passwordErr}
          </div>
        )}

        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

