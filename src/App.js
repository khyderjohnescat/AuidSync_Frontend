import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

function Layout() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Hide sidebar when on the login or password reset pages
    const hideSidebar = location.pathname === "/" || location.pathname === "/forgot-password" || location.pathname === "/reset-password";

    return (
        <div className="flex">
            {!hideSidebar && <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />} 
            
            <div 
                className={`flex-grow transition-all duration-300 ${!hideSidebar ? (isOpen ? 'ml-60' : 'ml-16') : ''}`}
            >
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                    <Route path="/orderlist" element={<ProtectedRoute><Orderlist /></ProtectedRoute>} />
                    <Route path="/ordersKitchen" element={<ProtectedRoute><OrdersKitchen /></ProtectedRoute>} />
                    <Route path="/manageproduct" element={<ProtectedRoute><Manageproduct /></ProtectedRoute>} />
                    <Route path="/products/deleted" element={<ProtectedRoute><DeletedProducts /></ProtectedRoute>} />
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
