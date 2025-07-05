import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useSocket = (groupId, onMessageReceived, onMessageEdited) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    const namespace = `/chat-${groupId}`;
    socketRef.current = io(`${SOCKET_URL}${namespace}`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.emit("joinRoom", groupId);

    socketRef.current.on("msgreceive", (msg) => {
      if (onMessageReceived) onMessageReceived(msg);
    });


    socketRef.current.on("editmsgrecieve", (msg) => {
      if (onMessageEdited) onMessageEdited(msg);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId, onMessageReceived, onMessageEdited]);

  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit("sendmsg", message);
    }
  };

  const editMessage = (editData) => {
    if (socketRef.current) {
      socketRef.current.emit("editMsg", editData);
    }
  };

  return { sendMessage, editMessage };
};
