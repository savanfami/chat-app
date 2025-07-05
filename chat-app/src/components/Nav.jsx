import React from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

const Nav = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let username = "";
  if (token) {
    const decoded = jwtDecode(token);
    username = decoded.username;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-900 text-white shadow-md">
      <div className="text-2xl font-semibold tracking-wide">ChaT</div>
      {token && (
        <div className="flex items-center space-x-4">
          {username && (
            <span className="text-white text-sm md:text-base">
              Welcome - <span className="font-medium text-xl  font-serif">{username}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-black cursor-pointer text-white text-sm md:text-base px-4 py-2 rounded-lg shadow transition duration-300"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Nav;
