import React from 'react'

const Nav = () => {
  //  const handleLogout = () => {
  //   // Perform logout logic here (e.g., clear token, Redux, localStorage)
  //   console.log("User logged out");
  //   // Redirect or navigate if needed
  // };
  return (
     <nav className="flex justify-between items-center p-4 bg-gray-600 text-white shadow-md">
      <div className="text-xl font-bold">ChaT</div>
      <div>
        <button
        
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Nav
