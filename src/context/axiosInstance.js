import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:6000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Ensures cookies are sent
});

// Add interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("🔄 Token expired, trying to refresh...");

            try {
                const refreshResponse = await axios.post("/auth/refresh", {}, { withCredentials: true });
                const newToken = refreshResponse.data.accessToken;
                localStorage.setItem("token", newToken);
                console.log("Token refreshed successfully");

                // Retry the failed request with new token
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(error.config);
            } catch (refreshError) {
                console.error("Token refresh failed, redirecting to login");
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
