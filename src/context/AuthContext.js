import { createContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user from localStorage on initial render
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("http://localhost:2000/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
    
                if (!response.ok) throw new Error("Not authenticated");
    
                const data = await response.json();
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
            } catch (error) {
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };
    
        if (!user) {  // Only fetch if user is not already set
            checkAuth();
        } else {
            setLoading(false);
        }
    }, [user]); // ✅ Add user to the dependency array

    const login = async (email, password) => {
        const response = await fetch("http://localhost:2000/api/auth/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        });

        if (!response.ok) throw new Error("Login failed");

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
    };

    const logout = async () => {
        await fetch("http://localhost:2000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        setUser(null);
        localStorage.removeItem("user");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
