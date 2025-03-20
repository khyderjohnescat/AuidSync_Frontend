import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ✅ Import back arrow icon
import axiosInstance from "../../context/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-md shadow-md w-full max-w-md relative">

        {/* ✅ Back Arrow Button (positioned within the container) */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 left-2 text-gray-400 hover:text-gray-200 transition"
        >
          <ArrowLeft size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Forgot Password
        </h2>

        {/* ✅ Success and Error Messages */}
        {message && (
          <p className="text-green-400 bg-green-900 p-3 rounded-md mb-4 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-400 bg-red-900 p-3 rounded-md mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          {/* ✅ Updated Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 font-semibold rounded ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            } text-white transition duration-300`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
