import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import React from "react";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ChatDashboard from "./components/chatComponents/ChatDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoutes";
import { SocketProvider } from "./context/socketContext";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <SocketProvider>
                <ChatDashboard />
              </SocketProvider>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
