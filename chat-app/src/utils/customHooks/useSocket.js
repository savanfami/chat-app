import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const SOCKET_URL = import.meta.env.VITE_SOCKETURL;

export const useSocket = (
  groupId,
  onMessageReceived,
  onMessageEdited,
  onMessageSeenUpdate,
  onMessageDeliveredUpdate 
) => {
  const socketRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token)?.userId : null;

  const handleMessageReceived = useCallback(
    (msg) => {
      if (msg.groupId === groupId && msg.sender._id !== currentUserId) {
        socketRef.current.emit("messageSeen", { groupId: msg.groupId });
      }

      if (onMessageReceived) onMessageReceived(msg);
    },
    [onMessageReceived, groupId, currentUserId]
  );

  const handleMessageEdited = useCallback(
    (msg) => {
      if (onMessageEdited) onMessageEdited(msg);
    },
    [onMessageEdited]
  );

  const handleMessageSeenUpdate = useCallback(
    (data) => {
      if (data.groupId === groupId && onMessageSeenUpdate) {
        onMessageSeenUpdate(data);
      }
    },
    [onMessageSeenUpdate, groupId]
  );

  const handleMessageDeliveredUpdate = useCallback(
    (data) => {
      console.log(data,'data frm upate goru delivery');
      if (data.groupId === groupId && onMessageDeliveredUpdate) {
        onMessageDeliveredUpdate(data);
      }
    },
    [onMessageDeliveredUpdate, groupId]
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
    socketRef.current.on("messageSeenUpdate", handleMessageSeenUpdate);
    socketRef.current.on(
      "messageDeliveredUpdate",
      handleMessageDeliveredUpdate
    ); 

    return () => {
      if (socketRef.current) {
        socketRef.current.off("msgreceive", handleMessageReceived);
        socketRef.current.off("editmsgrecieve", handleMessageEdited);
        socketRef.current.off("messageSeenUpdate", handleMessageSeenUpdate);
        socketRef.current.off(
          "messageDeliveredUpdate",
          handleMessageDeliveredUpdate
        ); 
        socketRef.current.disconnect();
      }
    };
  }, [
    groupId,
    handleMessageReceived,
    handleMessageEdited,
    handleMessageSeenUpdate,
    handleMessageDeliveredUpdate,
  ]);

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
