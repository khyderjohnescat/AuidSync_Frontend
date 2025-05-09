import { useState } from "react";
import { useLocation, Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import React Query
import useIdleTimeout from "./context/useIdleTimeout"; // Import the hook (adjust the path as needed)
import Login from "./components/pages/auth/Login";
import Dashboard from "./components/pages/staff/Dashboard/Staff_Dashboard";
import POS from "./components/pages/staff/Manage_Order/POS";
import Settings from "./components/pages/settings/Settings";
import Orderlist from "./components/pages/staff/Manage_Orderlist/Orderlist";
import KitchenOrderlist from "./components/pages/kitchenstaff/Manage_Orderlist/KitchenOrderlist";
import ProtectedRoute from "./components/services/ProtectedRoute";
import Sidebar from "./components/componentparts/Sidebar";
import Manageproduct from "./components/pages/staff/Manage_Products/ManageProducts";
import DeletedProducts from "./components/pages/staff/Manage_Products/deletedProducts";
import ForgotPassword from "./components/pages/auth/forgotpassword";
import ResetPassword from "./components/pages/auth/resetPassword";
import CompletedOrders from "./components/pages/staff/Manage_Orderlist/completedOrders";
import CancelledOrders from "./components/pages/staff/Manage_Orderlist/cancelledOrders";
import KitchenCompleteOrders from "./components/pages/kitchenstaff/Manage_Orderlist/kitchenCompleteOrders";
import CategoryManager from "./components/pages/staff/Manage_Products/ManageCategories";
import DiscountManager from "./components/pages/staff/Manage_Products/ManageDiscounts";
import AccountSecurity from "./components/pages/settings/AccountSecurity";
import AccountProfile from "./components/pages/settings/AccountProfile";
import ExpenseManager from "./components/pages/staff/Manage_Expenses/ManageExpenses";
import ExpenseCategories from "./components/pages/staff/Manage_Expenses/expensesCategory";
import AnalyticsDashboard from "./components/pages/admin/Dashboard/Admin_Dashboard";
import SalesDashboard from "./components/pages/admin/Dashboard/salesDashboard";
import StaffSalesDashboard from "./components/pages/staff/Dashboard/salesDashboard";
import ProfitsDashboard from "./components/pages/admin/Dashboard/profitsDashboard";
import OrdersDashboard from "./components/pages/admin/Dashboard/ordersDashboard";
import StaffOrdersDashboard from "./components/pages/staff/Dashboard/ordersDashboard";
import ExpensesDashboard from "./components/pages/admin/Dashboard/expensesDashboard";
import HelpSupport from "./components/pages/settings/HelpSupport";
import CustomerSupport from "./components/pages/helpsupport/CustomerSupport";
import ManageSupport from "./components/pages/devs/ManageSupport";
import ManageAllUsers from "./components/pages/devs/manageAccount";
import ManageAccount from "./components/pages/admin/createUser";
import AuditLogScreen from "./components/pages/admin/auditLogScreen";
import ManageSoftDeletedUsers from "./components/pages/devs/manageSoftDeleted";
import AdminManageSoftDeletedUsers from "./components/pages/admin/manageSoftDeleted";

import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient(); // Create QueryClient instance

function Layout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const hideIdleTimeout =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  useIdleTimeout(hideIdleTimeout ? Infinity : 1 * 60 * 60 * 1000);

  const hideSidebar = hideIdleTimeout;

  // Special case for the Customer Support page
  if (location.pathname === "/customersupport") {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <CustomerSupport />
      </div>
    );
  }

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
          <Route path="/manageexpenses" element={<ProtectedRoute><ExpenseManager isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/expensescategory" element={<ProtectedRoute><ExpenseCategories isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/admindashboard" element={<ProtectedRoute><AnalyticsDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/sales-dashboard" element={<ProtectedRoute><SalesDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/staff-sales-dashboard" element={<ProtectedRoute><StaffSalesDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/orders-dashboard" element={<ProtectedRoute><OrdersDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/staff-orders-dashboard" element={<ProtectedRoute><StaffOrdersDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/profits-dashboard" element={<ProtectedRoute><ProfitsDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/expenses-dashboard" element={<ProtectedRoute><ExpensesDashboard isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute><HelpSupport isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/manage-support" element={<ProtectedRoute><ManageSupport isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/manage-accounts" element={<ProtectedRoute><ManageAllUsers isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/audits" element={<ProtectedRoute><AuditLogScreen isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/admin-manage" element={<ProtectedRoute><ManageAccount isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/manage-soft-deleted-users" element={<ProtectedRoute><ManageSoftDeletedUsers isOpen={isOpen} /></ProtectedRoute>} />
          <Route path="/admin-manage-soft-deleted-users" element={<ProtectedRoute><AdminManageSoftDeletedUsers isOpen={isOpen} /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router> 
      <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
