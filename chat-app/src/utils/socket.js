import { io, Socket } from "socket.io-client";

let socket = null

export const getSocket = ()=> {
  if (!socket) {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    socket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("authError", (error) => {
      console.error("Authentication error:", error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};