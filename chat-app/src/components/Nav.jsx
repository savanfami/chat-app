import React from "react";
import { useNavigate } from "react-router"; 

const Nav = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-600 text-white shadow-md">
      <div className="text-xl font-bold">ChaT</div>
      <div>
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
