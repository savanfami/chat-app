import React, { createContext, useContext, useEffect,  useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
      },
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log(' Global Socket connected---:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(' Socket disconnected:', reason);
    });

    return () => {
      console.log('Cleaning up socket...');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useGlobalSocket = () => {
  return useContext(SocketContext);
};
