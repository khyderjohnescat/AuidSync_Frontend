import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../context/axiosInstance";

const useIdleTimeout = (timeout) => {
    if (!timeout || typeof timeout !== "number" || timeout <= 0) {
        throw new Error("Timeout must be a positive number in milliseconds");
    }

    const navigate = useNavigate();  
    const [lastActivity, setLastActivity] = useState(Date.now());

    const resetTimer = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    useEffect(() => {
        const checkIdle = setInterval(() => {
            const currentTime = Date.now();
            const timeSinceLastActivity = currentTime - lastActivity;

            if (timeSinceLastActivity >= timeout) {
                console.log(`User has been idle for ${timeout / 1000} seconds, logging out...`);

                // Clear any stored authentication data
                localStorage.removeItem("authToken"); // Adjust this to your actual auth storage
                sessionStorage.clear(); // Clear session data if used

                axiosInstance.logout()
                    .catch((error) => console.error("Error during logout:", error))
                    .finally(() => {
                        navigate("/"); // Ensure navigation to login
                        window.location.reload(); // Force a reload to clear state
                    });
            }
        }, 1000);

        return () => clearInterval(checkIdle);
    }, [lastActivity, timeout, navigate]);

    useEffect(() => {
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [resetTimer]);

    return resetTimer;
};

export default useIdleTimeout;
