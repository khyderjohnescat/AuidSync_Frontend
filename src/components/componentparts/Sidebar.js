import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaUtensils } from "react-icons/fa";
import { MdSpaceDashboard, MdRestaurantMenu, MdInventory, MdMoney, MdDashboard } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import AuthContext from "../../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout, isLoggingOut } = useContext(AuthContext); // Add isLoggingOut
    const location = useLocation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        if (isLoggingOut) return; // Prevent opening modal if already logging out
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        setIsLogoutModalOpen(false);
        await logout();
    };

    // Hide sidebar if the current route is "/customersupport"
    if (location.pathname === "/customersupport") {
        return null;
    }

    return (
        <>
            <div className={`bg-black text-white h-screen p-4 transition-all duration-300 fixed top-0 left-0 flex flex-col shadow-lg ${isOpen ? "w-60" : "w-16"}`}>
                <div className="flex justify-between items-center mb-6">
                    {isOpen && <img src="./images/logo1.png" alt="Brand Logo" className="w-20 h-auto object-contain" />}
                    <FaBars className="text-xl cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
                </div>

                <nav className="flex flex-col gap-4 flex-grow">
                    <NavItem to="/dashboard" icon={<MdSpaceDashboard />} text="Dashboard" isOpen={isOpen} location={location} />
                    <NavItem to="/pos" icon={<MdRestaurantMenu />} text="Order Menu" isOpen={isOpen} location={location} />
                    <NavItem to="/orderlist" icon={<HiOutlineClipboardList />} text="Order List" isOpen={isOpen} location={location} />
                    <NavItem to="/kitchenorderlist" icon={<FaUtensils />} text="Orders (Kitchen)" isOpen={isOpen} location={location} />
                    <NavItem to="/manageproduct" icon={<MdInventory />} text="Manage Products" isOpen={isOpen} location={location} />
                    <NavItem to="/manageexpenses" icon={<MdMoney />} text="Manage Expenses" isOpen={isOpen} location={location} />
                    <NavItem to="/admindashboard" icon={<MdDashboard />} text="Dashboard" isOpen={isOpen} location={location} />
                    <NavItem to="/manage-support" icon={<MdDashboard />} text="Dev Support" isOpen={isOpen} location={location} />
                    <NavItem to="/manage-accounts" icon={<MdDashboard />} text="Manage Accounts" isOpen={isOpen} location={location} />
                    <NavItem to="/audits" icon={<MdDashboard />} text="Audit" isOpen={isOpen} location={location} />
                    <NavItem to="/admin-manage" icon={<MdDashboard />} text="Create User" isOpen={isOpen} location={location} />
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <NavItem to="/settings" icon={<IoSettingsOutline />} text="Settings" isOpen={isOpen} location={location} />
                    <button
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                            isLoggingOut ? "opacity-50 cursor-not-allowed" : "hover:text-red-400 hover:bg-gray-800"
                        }`}
                    >
                        <IoLogOutOutline /> {isOpen && (isLoggingOut ? "Logging Out..." : "Logout")}
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && <LogoutModal onConfirm={handleConfirmLogout} onCancel={() => setIsLogoutModalOpen(false)} />}
        </>
    );
};

const NavItem = ({ to, icon, text, isOpen, location }) => {
    const isActive = location.pathname === to;

    return (
        <Link to={to} className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-800 hover:text-blue-400"}`}>
            {icon}
            {isOpen && <span>{text}</span>}
        </Link>
    );
};

// Logout Modal Component
const LogoutModal = ({ onConfirm, onCancel }) => {
    const { isLoggingOut } = useContext(AuthContext);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
                <h2 className="text-lg text-white font-semibold mb-4">Confirm Logout</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        disabled={isLoggingOut}
                        className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ${
                            isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoggingOut ? "Logging Out..." : "Yes, Logout"}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoggingOut}
                        className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;