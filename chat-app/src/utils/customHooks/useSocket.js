import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useSocket = (groupId, onMessageReceived,onLastMessageUpdate) => {
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
      // console.log(msg,'message from backend==')
      if (onMessageReceived) onMessageReceived(msg);
    });

    socketRef.current.on("updatelastmsg", (updatedGroup) => {
      console.log(updatedGroup,'newwwwwwwww')
      if (onLastMessageUpdate) onLastMessageUpdate(updatedGroup);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId]);

  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit("sendmsg", message);
    }
  };

  return { sendMessage };
};
