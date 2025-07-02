import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import React from "react";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} /> 
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
