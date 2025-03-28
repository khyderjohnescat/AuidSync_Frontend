import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    axios.get("/api/user/profile").then((response) => {
      setUser(response.data);
    });
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const updateProfile = async () => {
    await axios.put("/api/user/update", user);
    alert("Profile updated successfully");
  };

  const changePassword = async () => {
    await axios.put("/api/user/change-password", passwords);
    alert("Password changed successfully");
  };

  const uploadProfileImage = async () => {
    const formData = new FormData();
    formData.append("image", profileImage);
    await axios.post("/api/user/upload-avatar", formData);
    alert("Profile image updated successfully");
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto mt-10 border rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
      <input name="name" value={user.name} onChange={handleInputChange} placeholder="Name" className="mb-2 p-2 border rounded w-full" />
      <input name="email" value={user.email} onChange={handleInputChange} placeholder="Email" className="mb-2 p-2 border rounded w-full" />
      <button onClick={updateProfile} className="w-full bg-blue-500 text-white p-2 rounded">Update Profile</button>
      <hr className="my-4" />
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <input name="current" type="password" placeholder="Current Password" onChange={handlePasswordChange} className="mb-2 p-2 border rounded w-full" />
      <input name="new" type="password" placeholder="New Password" onChange={handlePasswordChange} className="mb-2 p-2 border rounded w-full" />
      <button onClick={changePassword} className="w-full bg-blue-500 text-white p-2 rounded">Change Password</button>
      <hr className="my-4" />
      <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
      <input type="file" onChange={handleProfileImageChange} className="mb-2" />
      <button onClick={uploadProfileImage} className="w-full bg-blue-500 text-white p-2 rounded">Upload</button>
    </div>
  );
};

export default Settings;