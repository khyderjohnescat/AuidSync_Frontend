import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import POS from "./components/pages/POS";
import Orderlist from "./components/pages/Orderlist";
import OrdersKitchen from "./components/pages/ordersKitchen";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/parts/Sidebar";
import Manageproduct from "./components/pages/Manageproduct";
import DeletedProducts from "./components/pages/deletedProducts";
import ForgotPassword from "./components/pages/forgotpassword";
import ResetPassword from "./components/pages/resetPassword";
import CompletedOrders from "./components/pages/completedOrders";
import CancelledOrders from "./components/pages/cancelledOrders";
import ReadyOrders from "./components/pages/readyOrders";
import DiscountManager from "./components/pages/discountManager";

function Layout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Hide sidebar when on the login or password reset pages
  const hideSidebar =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />}

      <div
        className={`flex-grow transition-all duration-300 ${
          !hideSidebar ? (isOpen ? "pl-60" : "pl-16") : ""
        }`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POS isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orderlist"
            element={
              <ProtectedRoute>
                <Orderlist isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordersKitchen"
            element={
              <ProtectedRoute>
                <OrdersKitchen isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageproduct"
            element={
              <ProtectedRoute>
                <Manageproduct isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/deleted"
            element={
              <ProtectedRoute>
                <DeletedProducts isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completedorders"
            element={
              <ProtectedRoute>
                <CompletedOrders isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cancelledorders"
            element={
              <ProtectedRoute>
                <CancelledOrders isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/readyorders"
            element={
              <ProtectedRoute>
                <ReadyOrders isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discounts"
            element={
              <ProtectedRoute>
                <DiscountManager isOpen={isOpen} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;