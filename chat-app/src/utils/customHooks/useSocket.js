import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useSocket = (groupId, onMessageReceived, onMessageEdited) => {
  const socketRef = useRef(null);

  // Memoize the callback functions to prevent unnecessary re-renders
  const handleMessageReceived = useCallback((msg) => {
    if (onMessageReceived) onMessageReceived(msg);
  }, [onMessageReceived]);

  const handleMessageEdited = useCallback((msg) => {
    console.log(msg, "msg from backend");
    if (onMessageEdited) onMessageEdited(msg);
  }, [onMessageEdited]);

  useEffect(() => {
    if (!groupId) return;

    const namespace = `/chat-${groupId}`;
    socketRef.current = io(`${SOCKET_URL}${namespace}`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.emit("joinRoom", groupId);

    // Set up event listeners
    socketRef.current.on("msgreceive", handleMessageReceived);
    socketRef.current.on("editmsgrecieve", handleMessageEdited);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("msgreceive", handleMessageReceived);
        socketRef.current.off("editmsgrecieve", handleMessageEdited);
        socketRef.current.disconnect();
      }
    };
  }, [groupId, handleMessageReceived, handleMessageEdited]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current) {
      socketRef.current.emit("sendmsg", message);
    }
  }, []);

  const editMessage = useCallback((editData) => {
    if (socketRef.current) {
      socketRef.current.emit("editMsg", editData);
    }
  }, []);

  return { sendMessage, editMessage };
};