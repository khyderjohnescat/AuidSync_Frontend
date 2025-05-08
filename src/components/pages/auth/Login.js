import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeadset } from "react-icons/fa"; // Import the customer support icon
import AuthContext from "../../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard"); // Redirect if logged in
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Extract the error message from the backend response
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again later.";

      // Map backend error messages to user-friendly messages
      if (errorMessage === "Account unrecognized") {
        setError("Account unrecognized. Please check your email or contact support.");
      } else if (errorMessage === "Account deactivated") {
        setError("Account deactivated. Please contact support to reactivate your account.");
      } else if (errorMessage === "Invalid credentials") {
        setError("Invalid email or password. Please try again.");
      } else if (errorMessage === "Server error") {
        setError("Something went wrong. Please try again later.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md"
        style={{ backgroundImage: "url('/Images/background.jpg')" }}
      ></div>

      {/* Content Wrapper */}
      <div className="relative flex flex-wrap w-full max-w-4xl bg-white bg-opacity-30 backdrop-blur-md shadow-2xl drop-shadow-lg rounded-lg overflow-hidden">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-gray-300 shadow-lg">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
              Smarter Financial Management Starts Here
            </h1>
            <p className="text-gray-600 text-md">
              <span className="font-semibold text-blue-600">Join us</span> today
              and take control of your business finances with our secure and
              intuitive platform.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-700 text-white p-10 shadow-xl">
          <div className="bg-gray-800 p-8 shadow-2xl drop-shadow-xl rounded-md w-full max-w-sm">
            <div className="flex justify-center mb-6">
              <img src="/Images/logo.png" alt="Logo" className="h-16" />
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="p-4">
              {/* Email Input */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-600 rounded bg-gray-700 text-white text-md focus:ring-2 focus:ring-blue-500"
                aria-label="Email"
                required
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 p-3 border border-gray-600 rounded bg-gray-700 text-white text-md focus:ring-2 focus:ring-blue-500"
                aria-label="Password"
                required
              />

              {/* Forgot Password Link */}
              <Link
                to="/forgot-password"
                className="text-sm text-gray-400 text-right block mb-4 hover:text-gray-200"
              >
                Forgot Password?
              </Link>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2 text-md font-semibold rounded ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition duration-300`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Customer Support Button */}
      <Link
        to="/customersupport"
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition duration-300"
        title="Customer Support"
      >
        <FaHeadset className="text-2xl" />
      </Link>
    </div>
  );
};

export default Login;