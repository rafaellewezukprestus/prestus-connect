import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, SocketMessage } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

export interface Chat {
  id: string;
  from: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  assignedTo?: string;
  assignedToName?: string;
  status: 'queue' | 'assigned' | 'closed';
  instanceId: string;
  messages: SocketMessage[];
  lastActivity: string;
}

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  queueChats: Chat[];
  assignedChats: Chat[];
  setSelectedChat: (chat: Chat | null) => void;
  sendMessage: (message: string) => void;
  assignChatToVA: (chatId: string, vaId: string, vaName: string) => void;
  returnToQueue: (chatId: string) => void;
  markAsRead: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { socket, isConnected, sendMessage: socketSendMessage, assignChatToVA: socketAssignChat, returnChatToQueue } = useSocket();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<Chat[]>([
    // Dados simulados - remover quando conectar ao MariaDB
    {
      id: '1',
      from: '5511999887766',
      contactName: 'João Silva',
      lastMessage: 'Olá, preciso de ajuda com meu pedido',
      timestamp: new Date().toISOString(),
      unreadCount: 2,
      status: 'queue',
      instanceId: '3DC6C526777550415408E2D55401DB6C',
      lastActivity: new Date().toISOString(),
      messages: [
        {
          id: '1',
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511999887766',
          to: '551134567890',
          message: 'Olá!',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text',
          chatId: '1'
        },
        {
          id: '2',
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511999887766',
          to: '551134567890',
          message: 'Preciso de ajuda com meu pedido',
          timestamp: new Date().toISOString(),
          type: 'text',
          chatId: '1'
        }
      ]
    }
  ]);
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Filtrar chats baseado no papel do usuário
  const getVisibleChats = () => {
    if (user?.role === 'VA') {
      return chats.filter(chat => 
        chat.status === 'queue' || chat.assignedTo === user.id
      );
    }
    return chats; // Supervisor e Dev veem tudo
  };

  const queueChats = chats.filter(chat => chat.status === 'queue');
  const assignedChats = chats.filter(chat => chat.status === 'assigned');

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Nova mensagem recebida
    socket.on('new-message', (message: SocketMessage) => {
      setChats(prev => {
        const existingChatIndex = prev.findIndex(chat => chat.from === message.from);
        
        if (existingChatIndex >= 0) {
          // Atualizar chat existente
          return prev.map((chat, index) => 
            index === existingChatIndex 
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessage: message.message,
                  timestamp: message.timestamp,
                  lastActivity: message.timestamp,
                  unreadCount: chat.assignedTo === user?.id ? chat.unreadCount : chat.unreadCount + 1
                }
              : chat
          );
        } else {
          // Criar novo chat na fila
          const newChat: Chat = {
            id: message.chatId,
            from: message.from,
            contactName: `Contato ${message.from.slice(-4)}`,
            lastMessage: message.message,
            timestamp: message.timestamp,
            unreadCount: 1,
            status: 'queue',
            instanceId: message.instanceId,
            lastActivity: message.timestamp,
            messages: [message]
          };
          return [newChat, ...prev];
        }
      });

      toast({
        title: "Nova mensagem",
        description: "Uma nova mensagem foi recebida",
      });
    });

    // Chat atribuído
    socket.on('chat-assigned', ({ chatId, vaId, vaName }: { chatId: string; vaId: string; vaName: string }) => {
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, assignedTo: vaId, assignedToName: vaName, status: 'assigned' as const }
          : chat
      ));

      if (vaId === user?.id) {
        toast({
          title: "Chat atribuído",
          description: "Um novo chat foi atribuído para você",
        });
      }
    });

    // Chat retornado para fila
    socket.on('chat-returned-to-queue', ({ chatId }: { chatId: string }) => {
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, assignedTo: undefined, assignedToName: undefined, status: 'queue' as const }
          : chat
      ));
    });

    // Atribuição automática de chat da fila
    socket.on('auto-assigned-chat', ({ chatId, vaId }: { chatId: string; vaId: string }) => {
      if (vaId === user?.id) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          toast({
            title: "Chat atribuído automaticamente",
            description: `Chat de ${chat.contactName} foi atribuído para você`,
          });
        }
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('chat-assigned');
      socket.off('chat-returned-to-queue');
      socket.off('auto-assigned-chat');
    };
  }, [socket, isConnected, user, chats, toast]);

  // Simular chegada de mensagens para teste - remover quando conectar socket real
  useEffect(() => {
    if (!user || user.role !== 'VA') return;

    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        const newMessage: SocketMessage = {
          id: Date.now().toString(),
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: `5511${Math.floor(Math.random() * 1000000000)}`,
          to: '551134567890',
          message: 'Nova mensagem de teste chegou!',
          timestamp: new Date().toISOString(),
          type: 'text',
          chatId: Date.now().toString()
        };

        // Simular nova mensagem
        setChats(prev => {
          const newChat: Chat = {
            id: newMessage.chatId,
            from: newMessage.from,
            contactName: `Contato ${newMessage.from.slice(-4)}`,
            lastMessage: newMessage.message,
            timestamp: newMessage.timestamp,
            unreadCount: 1,
            status: 'queue',
            instanceId: newMessage.instanceId,
            lastActivity: newMessage.timestamp,
            messages: [newMessage]
          };
          return [newChat, ...prev];
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = (message: string) => {
    if (!selectedChat || !message.trim()) return;

    const newMessage: SocketMessage = {
      id: Date.now().toString(),
      instanceId: selectedChat.instanceId,
      from: '551134567890', // Número da empresa
      to: selectedChat.from,
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
      chatId: selectedChat.id
    };

    // Atualizar estado local
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: message,
            timestamp: newMessage.timestamp,
            lastActivity: newMessage.timestamp
          }
        : chat
    ));

    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: message,
      timestamp: newMessage.timestamp,
      lastActivity: newMessage.timestamp
    } : null);

    // Enviar via socket
    socketSendMessage(selectedChat.id, message, selectedChat.from);
  };

  const assignChatToVA = (chatId: string, vaId: string, vaName: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, assignedTo: vaId, assignedToName: vaName, status: 'assigned' as const }
        : chat
    ));

    socketAssignChat(chatId, vaId);
    
    toast({
      title: "Chat atribuído",
      description: `Chat atribuído para ${vaName}`,
    });
  };

  const returnToQueue = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, assignedTo: undefined, assignedToName: undefined, status: 'queue' as const }
        : chat
    ));

    returnChatToQueue(chatId);
    
    toast({
      title: "Chat retornado",
      description: "Chat retornado para a fila",
    });
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));
  };

  return (
    <ChatContext.Provider
      value={{
        chats: getVisibleChats(),
        selectedChat,
        queueChats,
        assignedChats,
        setSelectedChat,
        sendMessage,
        assignChatToVA,
        returnToQueue,
        markAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};