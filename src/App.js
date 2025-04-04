import { useState } from "react";
import { useLocation, Routes, Route,  BrowserRouter as Router  } from "react-router-dom";
import useIdleTimeout from "./context/useIdleTimeout"; // Import the hook (adjust the path as needed)
import Login from "./components/pages/auth/Login";
import Dashboard from "./components/pages/staff/Staff_Dashboard";
import POS from "./components/pages/staff/POS";
import Settings from "./components/pages/settings/Settings";
import Orderlist from "./components/pages/staff/Orderlist";
import KitchenOrderlist from "./components/pages/kitchenstaff/KitchenOrderlist";
import ProtectedRoute from "./components/services/ProtectedRoute";
import Sidebar from "./components/componentparts/Sidebar";
import Manageproduct from "./components/pages/staff/ManageProducts";
import DeletedProducts from "./components/pages/staff/deletedProducts";
import ForgotPassword from "./components/pages/auth/forgotpassword";
import ResetPassword from "./components/pages/auth/resetPassword";
import CompletedOrders from "./components/pages/staff/completedOrders";
import CancelledOrders from "./components/pages/staff/cancelledOrders";
import KitchenCompleteOrders from "./components/pages/kitchenstaff/kitchenCompleteOrders";
import CategoryManager from "./components/pages/staff/ManageCategories";
import DiscountManager from "./components/pages/staff/ManageDiscounts";
import AccountSecurity from "./components/pages/settings/AccountSecurity";
import AccountProfile from "./components/pages/settings/AccountProfile";
import { AuthProvider } from "./context/AuthContext";

function Layout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Define whether to disable the idle timeout
  const hideIdleTimeout =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  // Call the hook unconditionally and control its effect inside the hook
  useIdleTimeout(hideIdleTimeout ? Infinity : 1 * 60 * 60 * 1000);

  // Hide sidebar when on login or password reset pages
  const hideSidebar = hideIdleTimeout;

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}
      <div className={`flex-grow transition-all duration-300 ${!hideSidebar ? (isOpen ? "pl-60" : "pl-16") : ""}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POS isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/orderlist" element={<ProtectedRoute><Orderlist isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/kitchenorderlist" element={<ProtectedRoute><KitchenOrderlist isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/manageproduct" element={<ProtectedRoute><Manageproduct isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/products/deleted" element={<ProtectedRoute><DeletedProducts isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/completedorders" element={<ProtectedRoute><CompletedOrders isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/cancelledorders" element={<ProtectedRoute><CancelledOrders isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/kitchencompleteorders" element={<ProtectedRoute><KitchenCompleteOrders isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/discounts" element={<ProtectedRoute><DiscountManager isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoryManager isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/account-profile" element={<ProtectedRoute><AccountProfile isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/account-security" element={<ProtectedRoute><AccountSecurity isOpen={isOpen} /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router> 
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
