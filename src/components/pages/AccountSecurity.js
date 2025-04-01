/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsEmail = () => {
  const [user, setUser] = useState({ email: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirmNew: "" });
  const [passwordError, setPasswordError] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    axiosInstance.get("/auth/profile").then((response) => {
      const { email } = response.data;
      setUser({ email });
    });
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const updateProfile = async () => {
    const { email } = user;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warn("Please enter a valid email address.");
      return;
    }
    setIsLoadingEmail(true);
    try {
      const response = await axiosInstance.put("/auth/update/email", { email });
      toast.success("Email changed successfully");
    } catch (error) {
      toast.error("Failed to update email");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirmNew) {
      setPasswordError("New password and confirm password do not match.");
      toast.warn("Passwords do not match");
      return;
    }
    setIsLoadingPassword(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        current: passwords.current,
        new: passwords.new,
      });
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirmNew: "" });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full bg-gray-900 text-white">
      <div className="w-full h-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Account Settings</h2>
        
        {/* Email Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Change Email</h3>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            placeholder="Enter new email"
            className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={updateProfile}
            disabled={isLoadingEmail}
            className="mt-2 w-full bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            {isLoadingEmail ? "Updating..." : "Update Email"}
          </button>
        </div>

        {/* Password Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <input
            type="password"
            name="current"
            placeholder="Current Password"
            value={passwords.current}
            onChange={handlePasswordChange}
            className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="new"
            placeholder="New Password"
            value={passwords.new}
            onChange={handlePasswordChange}
            className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="confirmNew"
            placeholder="Confirm New Password"
            value={passwords.confirmNew}
            onChange={handlePasswordChange}
            className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
          <button
            onClick={changePassword}
            disabled={isLoadingPassword}
            className="mt-2 w-full bg-green-600 p-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50"
          >
            {isLoadingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SettingsEmail;
