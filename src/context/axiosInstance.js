import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Ensures cookies are sent
});

// Interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("Token expired, trying to refresh...");

            try {
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken = refreshResponse.data.accessToken;
                localStorage.setItem("token", newToken);
                console.log("Token refreshed successfully");

                // Retry the failed request with the new token
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(error.config);
            } catch (refreshError) {
                console.error("Token refresh failed, logging out");

                // If the token refresh fails, clear the token and user data
                localStorage.removeItem("token");
                localStorage.removeItem("user"); 

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Logout function
axiosInstance.logout = async () => {
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
        console.log("Logged out successfully");
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    } finally {
        // Clear token and user data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user"); 
    }
};

export default axiosInstance;
