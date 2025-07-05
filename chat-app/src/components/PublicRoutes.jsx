import { Navigate } from "react-router";
import React from "react";
export const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/chat" replace /> : children;
};

