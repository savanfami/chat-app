import React, { useState } from "react";
import { axiosInstance } from "../../constants/axiosInstance";
import {useNavigate} from 'react-router'

const SignUp = () => {
  const navigate=useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const validate = () => {
    const newErrors = { username: "", email: "", password: "" };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axiosInstance.post("/auth/signup", formData);
        console.log("Signup successful:", response.data);
         navigate('/login')
       
      } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        // Show appropriate error to the user
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          SIGN UP HERE !!!
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full p-2 mb-1 border rounded"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mb-3">{errors.username}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-1 border rounded"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-3">{errors.email}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 mb-1 border rounded"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-3">{errors.password}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 cursor-pointer text-white py-2 rounded  transition"
        >
          Signup
        </button>
      </form> 
    </div>
  );
};

export default SignUp;
