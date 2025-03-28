import { Link } from "react-router-dom";


const Settings = () => {
  

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
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
    </div>
  );
};

export default Settings;