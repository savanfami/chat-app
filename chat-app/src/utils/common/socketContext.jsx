// import { createContext, useContext, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
// import React from 'react';

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     const socket = io(import.meta.env.VITE_SOCKETURL);
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Connected to global socket:', socket.id);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => {
//   return useContext(SocketContext);
// };
