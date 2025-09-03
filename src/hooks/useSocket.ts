import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SocketMessage {
  id: string;
  instanceId: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio';
  chatId: string;
}

export interface VAStatus {
  id: string;
  name: string;
  isOnline: boolean;
  activeChats: number;
  lastActivity: string;
}

export const useSocket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineVAs, setOnlineVAs] = useState<VAStatus[]>([]);

  useEffect(() => {
    if (!user) return;

    // TODO: Substituir pela URL do seu servidor socket.io
    const SOCKET_URL = 'ws://localhost:3001';
    
    socket.current = io(SOCKET_URL, {
      auth: {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      autoConnect: false
    });

    // Conectar apenas se for VA, Supervisor ou Dev
    if (['VA', 'Supervisor', 'Dev'].includes(user.role)) {
      socket.current.connect();
    }

    // Eventos de conexão
    socket.current.on('connect', () => {
      setIsConnected(true);
      console.log('Socket conectado:', socket.current?.id);
      
      // Registrar como VA online se for VA
      if (user.role === 'VA') {
        socket.current?.emit('va-online', {
          id: user.id,
          name: user.name,
          role: user.role
        });
      }
    });

    socket.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket desconectado');
    });

    socket.current.on('connect_error', (error) => {
      console.error('Erro de conexão socket:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor de mensagens",
        variant: "destructive"
      });
    });

    // Eventos de VAs online
    socket.current.on('vas-online-updated', (vas: VAStatus[]) => {
      setOnlineVAs(vas);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [user, toast]);

  const sendMessage = (chatId: string, message: string, to: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('send-message', {
        chatId,
        message,
        to,
        from: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const assignChatToVA = (chatId: string, vaId: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('assign-chat', { chatId, vaId });
    }
  };

  const returnChatToQueue = (chatId: string) => {
    if (socket.current && isConnected) {
      socket.current.emit('return-to-queue', { chatId });
    }
  };

  const setVAStatus = (isOnline: boolean) => {
    if (socket.current && isConnected && user?.role === 'VA') {
      socket.current.emit(isOnline ? 'va-online' : 'va-offline', {
        id: user.id,
        name: user.name
      });
    }
  };

  return {
    socket: socket.current,
    isConnected,
    onlineVAs,
    sendMessage,
    assignChatToVA,
    returnChatToQueue,
    setVAStatus
  };
};