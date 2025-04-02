/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useState } from "react";
import axiosInstance from "../context/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosInstance.get("/auth/me");
                setUser(response.data.user);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } catch (error) {
                console.error("Authentication error:", error.message);
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        if (!user) checkAuth();
        else setLoading(false);
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post("/auth/login", { email, password });
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (error) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const logout = async () => {
        try {
            // Call logout on the server
            await axiosInstance.logout();
            
            // Clear user data
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token"); // Ensure token is cleared as well
            
            // After logout, you can manually handle redirection in the component where AuthProvider is used
        } catch (error) {
            console.error("Logout failed:", error.message);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
