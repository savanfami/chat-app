import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKETURL;

export const useSocket = (groupId, onMessageReceived, onMessageEdited) => {
  const socketRef = useRef(null);

  const handleMessageReceived = useCallback(
    (msg) => {
      if(msg.groupId==groupId){
        socketRef.current.emit('messageSeen',{groupId:msg.groupId})
      }
      if (onMessageReceived) onMessageReceived(msg);
    },
    [onMessageReceived,groupId]
  );

  const handleMessageEdited = useCallback(
    (msg) => {
      if (onMessageEdited) onMessageEdited(msg);
    },
    [onMessageEdited]
  );

  useEffect(() => {
    if (!groupId) return;

    const namespace = `/chat-${groupId}`;
    socketRef.current = io(`${SOCKET_URL}${namespace}`, {
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.emit("joinRoom", groupId);

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
