import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { CgMenuBoxed } from "react-icons/cg";
import { RiListOrdered2 } from "react-icons/ri";
import { BiData } from "react-icons/bi";
import AuthContext from "../../context/AuthContext";
import { SiManageiq } from "react-icons/si";

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/"); // Redirect to login page after logout
    };

    return (
        <>
            {/* Fixed Sidebar */}
            <div className="fixed top-0 left-0 w-60 h-screen bg-black text-white p-4 overflow-y-auto shadow-lg">
                {/* Logo Section */}
                <div className="flex items-center justify-between mb-8">
                    <img
                        src="./images/logo1.png"
                        alt="Brand Logo"
                        className="w-32 h-auto object-contain"
                    />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-4 flex-grow">
                    <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400">
                        <RxDashboard /> Dashboard
                    </Link>
                    <Link to="/pos" className="flex items-center gap-2 hover:text-blue-400">
                        <CgMenuBoxed /> Order Menu
                    </Link>
                    <Link to="/orderlist" className="flex items-center gap-2 hover:text-blue-400">
                        <RiListOrdered2 /> Order List
                    </Link>
                    <Link to="/sales" className="flex items-center gap-2 hover:text-blue-400">
                        <BiData /> Sales
                    </Link>
                    <Link to="/Manageproduct" className="flex items-center gap-2 hover:text-blue-400">
                        <SiManageiq /> Manage Products
                    </Link>
                </nav>

                {/* Settings and Logout */}
                <div className="mt-auto">
                    <Link to="/settings" className="flex items-center gap-2 hover:text-blue-400">
                        <FaCog /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 mt-4">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Ensure Main Content is not overlapped */}
            <div className="pl-60">
                {/* Other page content goes here */}
            </div>
        </>
    );
};

export default Sidebar;
