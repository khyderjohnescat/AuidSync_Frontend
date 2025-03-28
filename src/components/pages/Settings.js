import React, { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Settings = () => {
  const [user, setUser] = useState({ first_name: "", last_name: "", email: "", role: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirmNew: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [passwordError, setPasswordError] = useState(""); 

  const API_BASE_URL = "http://localhost:5050";
  const PLACEHOLDER_IMAGE = "https://placehold.co/150"; 

  useEffect(() => {
    axiosInstance.get("/auth/profile").then((response) => {
      const { name, email, avatar, role } = response.data; 
      const [first_name, ...lastNameParts] = name.trim().split(" ");
      const last_name = lastNameParts.join(" ") || "";
      setUser({ first_name, last_name, email, role: role || "N/A" }); 
      setCurrentAvatar(avatar ? `${API_BASE_URL}${avatar}` : null);
    });
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError(""); 
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const updateProfile = async () => {
    const { first_name, last_name, email } = user;
    const name = `${first_name} ${last_name}`.trim();
    try {
      await axiosInstance.put("/auth/update", { name, email });
      toast.success("Profile updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update profile. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
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

    try {
      await axiosInstance.put("/auth/change-password", {
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
      toast.error("Failed to change password. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) {
      toast.warn("Please select an image to upload.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", profileImage);
    try {
      const response = await axiosInstance.post("/auth/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile image updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setImagePreview(null); 
      setCurrentAvatar(`${API_BASE_URL}${response.data.avatar}`); 
    } catch (error) {
      toast.error("Failed to upload profile image. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First Column: Profile Picture */}
          <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Profile Picture</h2>
            <div className="space-y-3">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-400 mb-1">Current Profile Picture:</p>
                <div className="flex justify-center">
                  <img
                    src={currentAvatar || PLACEHOLDER_IMAGE} 
                    alt="Current Profile"
                    className="w-24 h-24 object-cover rounded-full border border-gray-600"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile_image" className="block text-sm font-medium text-gray-400 mb-1">
                  Upload New Image
                </label>
                <input
                  id="profile_image"
                  type="file"
                  onChange={handleProfileImageChange}
                  className="w-full text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
              </div>
              {imagePreview && ( // Only show the Preview section if imagePreview is not null
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-400 mb-1">Preview:</p>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview} // Only show the new image preview
                      alt="Profile Preview"
                      className="w-24 h-24 object-cover rounded-full border border-gray-600"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={uploadProfileImage}
                disabled={!profileImage}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Second Column: Profile Information (with Role) */}
          <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-white mb-3">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  value={user.first_name}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  value={user.last_name}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <p className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg w-full text-sm">
                  {user.role}
                </p>
              </div>
              <button
                onClick={updateProfile}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md text-sm"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Third Column: Change Password (with Confirm New Password) */}
          <div className="p-4 bg-gray-800 rounded-lg shadow-sm">
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
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md text-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add ToastContainer to render notifications */}
      <ToastContainer />
    </div>
  );
};

export default Settings;