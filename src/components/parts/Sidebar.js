import { useContext } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaCog, FaSignOutAlt } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { CgMenuBoxed } from "react-icons/cg";
import { RiListOrdered2 } from "react-icons/ri";
import { BiData } from "react-icons/bi";
import { SiManageiq } from "react-icons/si";
import AuthContext from "../../context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useContext(AuthContext);

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
        <NavItem to="/dashboard" icon={<RxDashboard />} text="Dashboard" isOpen={isOpen} />
        <NavItem to="/pos" icon={<CgMenuBoxed />} text="Order Menu" isOpen={isOpen} />
        <NavItem to="/orderlist" icon={<RiListOrdered2 />} text="Order List" isOpen={isOpen} />
        <NavItem to="/sales" icon={<BiData />} text="Sales" isOpen={isOpen} />
        <NavItem to="/manageproduct" icon={<SiManageiq />} text="Manage Products" isOpen={isOpen} />
      </nav>
      
      <div className="mt-auto flex flex-col gap-4">
        <NavItem to="/settings" icon={<FaCog />} text="Settings" isOpen={isOpen} />
        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 hover:bg-gray-800 p-2 rounded-md">
          <FaSignOutAlt /> {isOpen && "Logout"}
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, text, isOpen }) => {
  return (
    <Link to={to} className="flex items-center gap-2 hover:text-blue-400 hover:bg-gray-800 p-2 rounded-md">
      {icon}
      {isOpen && <span>{text}</span>}
    </Link>
  );
};

export default Sidebar;