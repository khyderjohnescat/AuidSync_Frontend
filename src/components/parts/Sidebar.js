import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { CgMenuBoxed } from "react-icons/cg";
import { RiListOrdered2 } from "react-icons/ri";
import { BiData } from "react-icons/bi";
import AuthContext from "../../context/AuthContext";
import { SiManageiq } from "react-icons/si";

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/"); // Redirect to login page after logout
    };

    return (
        <div>
            {/* Hamburger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed top-4 left-4 z-50 text-white bg-black p-2 rounded-md md:hidden"
            >
                <FaBars size={20} />
            </button>

            {/* Sidebar */}
            <div 
                className={`fixed inset-y-0 left-0 bg-black text-white w-60 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform md:translate-x-0 md:relative md:flex flex-col p-4 h-screen`}
            >
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-bold">
                        Audi<span className="text-blue-400">Sync</span>
                    </span>
                    {/* Close button for mobile */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="md:hidden text-white"
                    >
                        ✖
                    </button>
                </div>
                
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
                        <SiManageiq/> Manage Products
                    </Link>
                </nav>

                <div className="mt-auto">
                    <Link to="/settings" className="flex items-center gap-2 hover:text-blue-400">
                        <FaCog /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 mt-4">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
