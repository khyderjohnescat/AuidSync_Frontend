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
      // Split the name into parts
      const nameParts = name.trim().split(/\s+/); // Split by any whitespace
      let first_name, last_name;

      if (nameParts.length === 1) {
        // Only first name (e.g., "John")
        first_name = nameParts[0];
        last_name = "";
      } else if (nameParts.length === 2) {
        // First name with one word and a last name (e.g., "John Smith")
        first_name = nameParts[0];
        last_name = nameParts[1];
      } else {
        // First name with two words and a last name (e.g., "John Paul Smith")
        first_name = `${nameParts[0]} ${nameParts[1]}`; // First two words as first_name
        last_name = nameParts.slice(2).join(" "); // Everything else as last_name
      }

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

    // Validate first_name to ensure it has at most two words
    const firstNameParts = first_name.trim().split(/\s+/);
    if (firstNameParts.length > 2) {
      toast.warn("First name can only have up to two words.", { position: "top-center", autoClose: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      // Combine first_name and last_name into a single name string
      const name = `${first_name.trim()} ${last_name.trim()}`.trim();
      const response = await axiosInstance.put("/auth/update/name", { name });
      toast.success(
        response.data.message !== "No changes made to name"
          ? "Profile updated successfully"
          : "No changes made to your profile.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );

      // Update the local state to reflect the new name split
      const nameParts = name.trim().split(/\s+/);
      let updatedFirstName, updatedLastName;

      if (nameParts.length === 1) {
        updatedFirstName = nameParts[0];
        updatedLastName = "";
      } else if (nameParts.length === 2) {
        updatedFirstName = nameParts[0];
        updatedLastName = nameParts[1];
      } else {
        updatedFirstName = `${nameParts[0]} ${nameParts[1]}`;
        updatedLastName = nameParts.slice(2).join(" ");
      }

      setUser((prev) => ({
        ...prev,
        first_name: updatedFirstName,
        last_name: updatedLastName,
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.", {
        position: "top-center",
        autoClose: 3000,
      });
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
      toast.error(error.response?.data?.message || "Failed to upload profile image.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-full bg-gray-800 rounded-lg text-white p-6 space-y-8 md:space-y-0 md:space-x-12">
      <div className="text-center md:w-1/3">
        <h2 className="text-2xl font-bold mb-6">Profile Picture</h2>
        <img
          src={currentAvatar || PLACEHOLDER_IMAGE}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-600 shadow-md"
        />
        <input
          type="file"
          onChange={handleProfileImageChange}
          className="w-full py-2 px-3 bg-gray-700 text-gray-300 rounded-lg mb-4"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 rounded-full mx-auto border-4 border-gray-600 shadow-md"
          />
        )}
        <button
          onClick={uploadProfileImage}
          disabled={!profileImage || isUploading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-600"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 m-2">Role</label>
            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
              {user.role}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-400">First Name (One or Two Words)</label>
            <input
              name="first_name"
              value={user.first_name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John or John Paul"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Last Name</label>
            <input
              name="last_name"
              value={user.last_name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Smith"
            />
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