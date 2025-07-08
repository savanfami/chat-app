import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { axiosInstance } from "../../constants/axiosInstance";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login", formData);
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      navigate("/chat", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-200">
        <img
          src="https://www.figma.com/community/resource/b2999579-a1a0-4e50-90c1-89f8c4cbb79d/thumbnail"
          alt="Design Thumbnail"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="w-1/2 flex justify-center items-center bg-gray-900">
        <form
          onSubmit={handleLogin}
          className="bg-gray-700 p-8 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-white uppercase text-center">Login</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded text-white"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded text-white"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <Link to="/signup" className="text-white underline">
              Sign Up here!!!
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
