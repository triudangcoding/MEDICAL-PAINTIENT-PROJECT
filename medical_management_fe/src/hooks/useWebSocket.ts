import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface WebSocketMessage {
  patientId: string;
  status: string;
  timestamp: string;
  message: string;
}

export const useWebSocket = (token?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Tạo WebSocket connection
    const newSocket = io(`${import.meta.env.VITE_API_URL}/medical-management`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
      
      // Join doctor room để nhận notifications
      newSocket.emit('join-room', { room: 'doctors' });
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for adherence updates
    newSocket.on('adherence-updated', (data: WebSocketMessage) => {
      console.log('Received adherence update:', data);
      
      // Hiển thị toast notification
      toast.success(data.message, {
        duration: 3000,
        icon: '✅',
      });
      
      // Trigger custom event để các component khác có thể listen
      window.dispatchEvent(new CustomEvent('adherence-updated', {
        detail: data
      }));
    });

    // Listen for doctor warnings
    newSocket.on('doctor-warning', (data: WebSocketMessage) => {
      console.log('Received doctor warning:', data);
      
      toast(data.message, {
        duration: 4000,
        icon: '⚠️',
      });
      
      window.dispatchEvent(new CustomEvent('doctor-warning', {
        detail: data
      }));
    });

    // Listen for broadcast updates
    newSocket.on('adherence-broadcast', (data: WebSocketMessage) => {
      console.log('Received adherence broadcast:', data);
      
      toast.success(data.message, {
        duration: 3000,
        icon: '🔄',
      });
      
      window.dispatchEvent(new CustomEvent('adherence-broadcast', {
        detail: data
      }));
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join-room', { room });
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave-room', { room });
    }
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
  };
};
