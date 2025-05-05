import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../componentparts/getCroppedImg";
const SettingsProfile = () => {
  const [user, setUser] = useState({ first_name: "", last_name: "", role: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const API_BASE_URL = "http://localhost:5050";
  const PLACEHOLDER_IMAGE = "https://placehold.co/150";

  useEffect(() => {
    axiosInstance.get("/auth/profile").then((response) => {
      const { name, avatar, role } = response.data;
      const nameParts = name.trim().split(/\s+/);
      let first_name, last_name;

      if (nameParts.length === 1) {
        first_name = nameParts[0];
        last_name = "";
      } else if (nameParts.length === 2) {
        first_name = nameParts[0];
        last_name = nameParts[1];
      } else {
        first_name = `${nameParts[0]} ${nameParts[1]}`;
        last_name = nameParts.slice(2).join(" ");
      }

      setUser({ first_name, last_name, role: role || "N/A" });
      setCurrentAvatar(avatar ? `${API_BASE_URL}${avatar}` : null);
    });
  }, []);

  const handleInputChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowCropper(true); // Show cropper modal when image is selected rainy
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setShowCropper(false);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      setImagePreview(croppedImage); // Update preview with cropped image
      // Convert cropped image (base64) to a File object for upload
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], profileImage.name, { type: profileImage.type });
      setProfileImage(file); // Update profileImage with cropped file
      setShowCropper(false); // Close cropper modal
    } catch (error) {
      toast.error("Failed to crop image.", { position: "top-center", autoClose: 3000 });
    }
  };

  const updateProfile = async () => {
    const { first_name, last_name } = user;
    if (!first_name.trim()) {
      toast.warn("First name is required.", { position: "top-center", autoClose: 3000 });
      return;
    }

    const firstNameParts = first_name.trim().split(/\s+/);
    if (firstNameParts.length > 2) {
      toast.warn("First name can only have up to two words.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const name = `${first_name.trim()} ${last_name.trim()}`.trim();
      const response = await axiosInstance.put("/auth/update/name", { name });
      toast.success(
        response.data.message !== "No changes made to name"
          ? "Profile updated successfully"
          : "No changes made to your profile.",
        { position: "top-center", autoClose: 3000 }
      );

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
      toast.warn("Please select and crop an image to upload.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", profileImage);
    try {
      const response = await axiosInstance.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile image updated successfully", {
        position: "top-center",
        autoClose: 3000,
      });
      setImagePreview(null);
      setProfileImage(null); // Reset profileImage after upload
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
// Container for the entire SettingsProfile component
<div className="flex flex-col md:flex-row justify-center items-center min-h-full bg-gray-800 rounded-lg text-white p-6 space-y-8 md:space-y-0 md:space-x-12">
  {/* Profile Picture Section */}
  <div className="text-center md:w-1/3">
    <h2 className="text-2xl font-bold mb-6">Profile Picture</h2>

    {/* Hidden File Input */}
    <input
      id="avatarUpload"
      type="file"
      accept="image/*"
      onChange={handleProfileImageChange}
      className="hidden"
    />

    {/* Clickable Image */}
    <label htmlFor="avatarUpload" className="cursor-pointer">
      <img
        src={imagePreview || currentAvatar || PLACEHOLDER_IMAGE}
        alt="Profile"
        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-600 shadow-md hover:opacity-80 transition"
      />
    </label>

    <button
      onClick={uploadProfileImage}
      disabled={!profileImage || isUploading}
      className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition disabled:bg-gray-600"
    >
      {isUploading ? "Uploading..." : "Upload Image"}
    </button>
  </div>

  {/* Profile Information Section */}
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
        <label className="text-sm text-gray-400">First Name</label>
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

  {/* Cropper Modal */}
  {showCropper && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-white">Crop Image</h3>
        <div className="relative w-full h-64">
          <Cropper
            image={imagePreview}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio for profile picture
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round" // Circular crop shape
          />
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => setShowCropper(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  )}

  <ToastContainer />
</div>
);
};

export default SettingsProfile;