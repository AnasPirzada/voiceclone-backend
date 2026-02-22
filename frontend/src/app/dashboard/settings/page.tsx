"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import apiClient from "@/lib/api/client";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await apiClient.patch("/auth/profile", { full_name: fullName });
      await fetchUser();
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage(`Error: ${getErrorMessage(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed</p>
            </div>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                {saveMessage}
              </p>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Security</h2>

          {passwordSuccess && (
            <p className="text-sm text-green-400 mb-4">{passwordSuccess}</p>
          )}

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gray-500 hover:text-white transition-all"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Update Password"}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-6 py-2.5 border border-gray-600 text-gray-400 rounded-lg font-medium hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Plan</span>
              <span className="text-green-400 font-semibold">Free (Unlimited)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Member Since</span>
              <span className="text-gray-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Role</span>
              <span className="text-gray-200 capitalize">{user?.role || "user"}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 rounded-xl p-6 bg-red-500/5">
          <h2 className="text-lg font-semibold mb-2 text-red-400">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back.</p>
          <button className="px-6 py-2.5 border border-red-500/40 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
