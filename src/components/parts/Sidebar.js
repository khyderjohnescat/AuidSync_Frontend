import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaUtensils } from "react-icons/fa";
import { MdSpaceDashboard, MdRestaurantMenu, MdInventory } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import AuthContext from "../../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={`bg-black text-white h-screen p-4 transition-all duration-300 fixed top-0 left-0 flex flex-col shadow-lg ${
        isOpen ? "w-60" : "w-16"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        {isOpen && <img src="./images/logo1.png" alt="Brand Logo" className="w-20 h-auto object-contain" />}
        <FaBars className="text-xl cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
      </div>
      
      <nav className="flex flex-col gap-4 flex-grow">
        <NavItem to="/dashboard" icon={<MdSpaceDashboard />} text="Dashboard" isOpen={isOpen} location={location} />
        <NavItem to="/pos" icon={<MdRestaurantMenu />} text="Order Menu" isOpen={isOpen} location={location} />
        <NavItem to="/orderlist" icon={<HiOutlineClipboardList />} text="Order List" isOpen={isOpen} location={location} />
        <NavItem to="/ordersKitchen" icon={<FaUtensils />} text="Orders (Kitchen)" isOpen={isOpen} location={location} />
        <NavItem to="/manageproduct" icon={<MdInventory />} text="Manage Products" isOpen={isOpen} location={location} />
      </nav>
      
      <div className="mt-auto flex flex-col gap-4">
        <NavItem to="/settings" icon={<IoSettingsOutline />} text="Settings" isOpen={isOpen} location={location} />
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 hover:bg-gray-800 p-2 rounded-md">
          <IoLogOutOutline /> {isOpen && "Logout"}
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, text, isOpen, location }) => {
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
        isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-800 hover:text-blue-400"
      }`}
    >
      {icon}
      {isOpen && <span>{text}</span>}
    </Link>
  );
};

export default Sidebar;