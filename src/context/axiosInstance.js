import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Ensures cookies are sent
});

// Attach token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("No token found in localStorage for request:", config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("Token expired or unauthorized, trying to refresh...");

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
                console.error("Token refresh failed, redirecting to login:", refreshError.response?.data || refreshError.message);

                // If the token refresh fails, clear the token and user data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/"; // Redirect to login page
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Custom logout method
axiosInstance.logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Redirect to login page
};

export default axiosInstance;