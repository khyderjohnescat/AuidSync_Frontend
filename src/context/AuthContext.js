import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    // Auto-refresh session on component mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await axios.post("http://localhost:2000/api/auth/refresh", {}, { withCredentials: true });

                if (res.data.user) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    localStorage.setItem("accessToken", res.data.accessToken); // Store token
                }
            } catch (error) {
                console.log("Session expired or not found");
                setUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
            }
        };
        checkSession();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const res = await axios.post("http://localhost:2000/api/auth/login", { email, password }, { withCredentials: true });

            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("accessToken", res.data.accessToken); // Store token
        } catch (error) {
            throw new Error("Login failed!");
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post("http://localhost:2000/api/auth/logout", {}, { withCredentials: true });
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken"); // Remove token
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
