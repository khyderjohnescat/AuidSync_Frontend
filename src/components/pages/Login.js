import { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            navigate("/dashboard"); // Redirect if already logged in
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-lg rounded-md">
                <h2 className="text-xl font-semibold mb-4">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"/>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"/>
                <button className="bg-blue-500 text-white w-full py-2 rounded">Login</button>
            </form>
        </div>
    );
};

export default Login;
