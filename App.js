import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./src/components/pages/Login.js";
import Dashboard from "./src/components/pages/Dashboard.js";
import POS from "./src/components/pages/POS.js";
import Inventory from "./src/components/pages/Inventory.js";
import Sales from "./src/components/pages/Sales.js";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
