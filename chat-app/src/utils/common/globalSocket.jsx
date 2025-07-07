import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useGlobalSocket = () => {
  const socketRef = useRef(null);
  
  useEffect(() => {
    console.log('Attempting to connect to Socket.IO server...');
    
    const socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try both transports
      timeout: 20000, // 20 second timeout
      forceNew: true,
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('✅ Connected to global socket:', socket.id);
      console.log('Transport:', socket.io.engine.transport.name);
    });
    
    socket.on('globalConnected', (data) => {
      console.log('✅ Global connection confirmed:', data.message);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error type:', error.type);
      console.error('Error description:', error.description);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });
    
    // Test if the server is reachable
    // fetch('http://localhost:3000')
    //   .then(() => console.log('✅ Server is reachable'))
    //   .catch(() => console.error('❌ Server is not reachable'));
    
    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };
  }, []);
  
  return socketRef;
};