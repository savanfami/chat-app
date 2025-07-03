import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // backend URL

export const useSocket = (groupId, onMessageReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;

    // connect to namespace like /chat-123
    const namespace = `/chat-${groupId}`;
    socketRef.current = io(`${SOCKET_URL}${namespace}`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    // Join room
    socketRef.current.emit('joinRoom', groupId);

    // Listen for incoming messages
    socketRef.current.on('message:receive', (msg) => {
      if (onMessageReceived) onMessageReceived(msg);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [groupId]);

  // Send message
  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit('message:create', message);
    }
  };

  return { sendMessage };
};
