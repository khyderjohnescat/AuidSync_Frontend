import React, { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const SettingsProfile = () => {
  const [user, setUser] = useState({ first_name: "", last_name: "", role: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for update profile
  const [isUploading, setIsUploading] = useState(false); // Loading state for image upload

  const API_BASE_URL = "http://localhost:5050";
  const PLACEHOLDER_IMAGE = "https://placehold.co/150";

  useEffect(() => {
    axiosInstance.get("/auth/profile").then((response) => {
      const { name, avatar, role } = response.data;
      const [first_name, ...lastNameParts] = name.trim().split(" ");
      const last_name = lastNameParts.join(" ") || "";
      setUser({ first_name, last_name, role: role || "N/A" });
      setCurrentAvatar(avatar ? `${API_BASE_URL}${avatar}` : null);
    });
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
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
    const { first_name, last_name } = user;
    const name = `${first_name} ${last_name}`.trim();

    // Basic validation: ensure first name is not empty
    if (!first_name.trim()) {
      toast.warn("First name is required.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put("/auth/update/name", { name });
      if (response.data.message === "No changes made to name") {
        toast.info("No changes made to your profile.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.success("Profile updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
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

    setIsUploading(true);
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
      const errorMessage = error.response?.data?.message || "Failed to upload profile image. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsUploading(false);
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
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-400 mb-1">Preview:</p>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-24 h-24 object-cover rounded-full border border-gray-600"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={uploadProfileImage}
                disabled={!profileImage || isUploading}
                className={`w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed text-sm ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </div>

          <div className="p-4 h-100 bg-gray-800 rounded-lg shadow-sm">
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  👤 {user.role}
                </span>
              </div>
              <button
                onClick={updateProfile}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md text-sm ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SettingsProfile;