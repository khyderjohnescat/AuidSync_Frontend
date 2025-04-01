import React, { useState } from "react";
import AccountProfile from "./AccountProfile";
import AccountSecurity from "./AccountSecurity";

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("account-profile"); // Default to Profile Info

  return (
    <div className="min-h-screen bg-gray-800 flex">
      {/* Sidebar */}
      <div className="w-45 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold text-center mb-6">Settings</h2>
        <div className="space-y-3">
          <button
            className={`w-full px-4 py-2 rounded-md text-left ${
              selectedTab === "account-profile"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("account-profile")}
          >
            Profile Information
          </button>
          <button
            className={`w-full px-4 py-2 rounded-md text-left ${
              selectedTab === "account-security"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("account-security")}
          >
            Account Security 
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-900 p-8">
        {/* Conditional Rendering */}
        {selectedTab === "account-profile" && <AccountProfile />}
        {selectedTab === "account-security" && <AccountSecurity />}
      </div>
    </div>
  );
};

export default Settings;
