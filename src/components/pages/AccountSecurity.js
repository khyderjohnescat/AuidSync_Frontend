/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warn("Please enter a valid email address.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoadingEmail(true);
    try {
      const response = await axiosInstance.put("/auth/update/email", { email });
      if (response.data.message === "No changes made to email") {
        toast.info("No changes made to your email.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.success("Email changed successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update email. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const changePassword = async () => {
    // Validate that new password and confirm new password match
    if (passwords.new !== passwords.confirmNew) {
      setPasswordError("New password and confirm password do not match.");
      toast.warn("New password and confirm password do not match.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwords.new)) {
      setPasswordError(
        "New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
      );
      toast.warn(
        "New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return;
    }

    // Check if current and new password are the same
    if (passwords.current === passwords.new) {
      setPasswordError("New password must be different from the current password.");
      toast.warn("New password must be different from the current password.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoadingPassword(true);
    try {
      const response = await axiosInstance.put("/auth/change-password", {
        current: passwords.current,
        new: passwords.new,
      });
      toast.success("Password changed successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setPasswords({ current: "", new: "", confirmNew: "" });
      setPasswordError("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to change password. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full h-100 max-w-4xl bg-gray-900 rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 h-100 bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Information Settings</h2>
            <Link
              to="/account-profile"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Account Profile
            </Link>
            <Link
              to="/account-security"
              className="flex items-center my-5 gap-2 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Account Security
            </Link>
          </div>
          <div className="p-4 h-100 bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Change Email</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                onClick={updateProfile}
                disabled={isLoadingEmail}
                className={`w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md text-sm ${
                  isLoadingEmail ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoadingEmail ? "Updating..." : "Update Email"}
              </button>
            </div>
          </div>
          <div className="p-4 h-100 bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Change Password</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-400 mb-1">
                  Current Password
                </label>
                <input
                  id="current_password"
                  name="current"
                  type="password"
                  placeholder="Current Password"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  id="new_password"
                  name="new"
                  type="password"
                  placeholder="New Password"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm_new_password"
                  name="confirmNew"
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirmNew}
                  onChange={handlePasswordChange}
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
              <button
                onClick={changePassword}
                disabled={isLoadingPassword}
                className={`w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md text-sm ${
                  isLoadingPassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoadingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SettingsEmail;