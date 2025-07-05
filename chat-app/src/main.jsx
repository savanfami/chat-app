import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import React from "react";
// import { SocketProvider } from "./utils/common/socketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* <SocketProvider> */}
        <App />
      {/* </SocketProvider> */}
    </BrowserRouter>
  </StrictMode>
);
 