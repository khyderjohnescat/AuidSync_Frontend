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
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Add state to prevent multiple logout requests

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
                localStorage.removeItem("token"); // Clear token if auth check fails
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
            // No need to store token manually since backend uses cookies
        } catch (error) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const logout = async () => {
        if (isLoggingOut) return; // Prevent multiple logout requests
        setIsLoggingOut(true);

        try {
            await axiosInstance.post("/auth/logout");
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        } catch (error) {
            console.error("Logout failed:", error.message);
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        } finally {
            setIsLoggingOut(false);
            // Redirect using navigate instead of window.location.href
            window.location.href = "/";
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;