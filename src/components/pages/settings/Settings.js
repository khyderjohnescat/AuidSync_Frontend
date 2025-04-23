import React, { useState } from "react";
import AccountProfile from "./AccountProfile";
import AccountSecurity from "./AccountSecurity";
import HelpSupport from "./HelpSupport";

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("account-profile");

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar: sticky and full height */}
      <div className="w-64 h-screen sticky top-0 bg-gray-800 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="space-y-3 w-full">
          <button
            className={`w-full px-4 py-3 rounded-md text-left transition ${
              selectedTab === "account-profile" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("account-profile")}
          >
            Profile Information
          </button>
          <button
            className={`w-full px-4 py-3 rounded-md text-left transition ${
              selectedTab === "account-security" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("account-security")}
          >
            Account Security
          </button>
          <button
            className={`w-full px-4 py-3 rounded-md text-left transition ${
              selectedTab === "help-support" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("help-support")}
          >
            Help & Support
          </button>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 rounded-lg">
          {selectedTab === "account-profile" && <AccountProfile />}
          {selectedTab === "account-security" && <AccountSecurity />}
          {selectedTab === "help-support" && <HelpSupport />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
