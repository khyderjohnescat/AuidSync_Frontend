import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import POS from "./components/pages/POS";
import Orderlist from "./components/pages/Orderlist";
import Sales from "./components/pages/Sales";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/parts/Sidebar";
import Manageproduct from "./components/pages/Manageproduct";


function Layout() {
    const location = useLocation();
    
    // Hide sidebar when on the login page
    const hideSidebar = location.pathname === "/";

    return (
        <div className="flex">
            {!hideSidebar && <Sidebar />}
            <div className="flex-grow">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                    <Route path="/orderlist" element={<ProtectedRoute><Orderlist /></ProtectedRoute>} />
                    <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
                    <Route path="/manageproduct" element={<ProtectedRoute><Manageproduct /></ProtectedRoute>} />

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
