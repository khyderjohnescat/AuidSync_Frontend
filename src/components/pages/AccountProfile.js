import React, { useState, useEffect } from "react";
import axiosInstance from "../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsProfile = () => {
  const [user, setUser] = useState({ first_name: "", last_name: "", role: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleInputChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const updateProfile = async () => {
    const { first_name, last_name } = user;
    if (!first_name.trim()) {
      toast.warn("First name is required.", { position: "top-center", autoClose: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put("/auth/update/name", { name: `${first_name} ${last_name}`.trim() });
      toast.success(response.data.message !== "No changes made to name" ? "Profile updated successfully" : "No changes made to your profile.", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.", { position: "top-center", autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) {
      toast.warn("Please select an image to upload.", { position: "top-center", autoClose: 3000 });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", profileImage);
    try {
      const response = await axiosInstance.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile image updated successfully", { position: "top-center", autoClose: 3000 });
      setImagePreview(null);
      setCurrentAvatar(`${API_BASE_URL}${response.data.avatar}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload profile image.", { position: "top-center", autoClose: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl">
      {/* Profile Picture Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Profile Picture</h2>
        <img src={currentAvatar || PLACEHOLDER_IMAGE} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-600 shadow-md" />
        <input type="file" onChange={handleProfileImageChange} className="w-full py-2 px-3 bg-gray-700 text-gray-300 rounded-lg mb-4" />
        {imagePreview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Preview:</p>
            <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full mx-auto border-4 border-gray-600 shadow-md" />
          </div>
        )}
        <button
          onClick={uploadProfileImage}
          disabled={!profileImage || isUploading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-600"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Profile Information Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
        <div className="space-y-5">
          {/* First Name Input */}
          <div>
            <label htmlFor="first_name" className="text-sm text-gray-400">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={user.first_name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Last Name Input */}
          <div>
            <label htmlFor="last_name" className="text-sm text-gray-400">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              value={user.last_name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Role */}
          <div>
            <label className="text-sm text-gray-400 p-2">Role</label>
            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">{user.role}</span>
          </div>
          <button
            onClick={updateProfile}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition disabled:bg-gray-600"
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SettingsProfile;
