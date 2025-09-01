import { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, MoreVertical, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { ZApiMessage } from '@/types/zapi';

interface Chat {
  id: string;
  from: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  assignedTo?: string;
  assignedToName?: string;
  status: 'open' | 'assigned' | 'closed';
  instanceId: string;
  messages: ZApiMessage[];
}

const Chats = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      from: '5511999887766',
      contactName: 'João Silva',
      lastMessage: 'Olá, preciso de ajuda com meu pedido',
      timestamp: new Date().toISOString(),
      unreadCount: 2,
      status: 'open',
      instanceId: '3DC6C526777550415408E2D55401DB6C',
      messages: [
        {
          id: '1',
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511999887766',
          to: '551134567890',
          message: 'Olá!',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511999887766',
          to: '551134567890',
          message: 'Preciso de ajuda com meu pedido',
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'received'
        }
      ]
    },
    {
      id: '2',
      from: '5511888776655',
      contactName: 'Maria Santos',
      lastMessage: 'Quando meu produto será entregue?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      unreadCount: 1,
      status: 'assigned',
      assignedTo: '1',
      assignedToName: 'João (VA)',
      instanceId: '3DC6C526777550415408E2D55401DB6C',
      messages: [
        {
          id: '3',
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511888776655',
          to: '551134567890',
          message: 'Quando meu produto será entregue?',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          type: 'text',
          status: 'received'
        }
      ]
    }
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');

  // Simular chegada de novas mensagens para teste
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance de nova mensagem a cada 10 segundos
        const newMessage: ZApiMessage = {
          id: Date.now().toString(),
          instanceId: '3DC6C526777550415408E2D55401DB6C',
          from: '5511777666555',
          to: '551134567890',
          message: 'Nova mensagem de teste chegou!',
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'received'
        };

        const existingChatIndex = chats.findIndex(chat => chat.from === newMessage.from);
        
        if (existingChatIndex >= 0) {
          setChats(prev => prev.map((chat, index) => 
            index === existingChatIndex 
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage.message,
                  timestamp: newMessage.timestamp,
                  unreadCount: chat.unreadCount + 1
                }
              : chat
          ));
        } else {
          const newChat: Chat = {
            id: Date.now().toString(),
            from: newMessage.from,
            contactName: 'Novo Contato',
            lastMessage: newMessage.message,
            timestamp: newMessage.timestamp,
            unreadCount: 1,
            status: 'open',
            instanceId: newMessage.instanceId,
            messages: [newMessage]
          };
          setChats(prev => [newChat, ...prev]);
        }

        toast({
          title: "Nova mensagem recebida",
          description: "Uma nova mensagem chegou via Z-API",
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [chats, toast]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.from.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    
    // Filtrar por permissão do usuário
    if (user?.role === 'VA') {
      return matchesSearch && matchesStatus && (chat.assignedTo === user.id || !chat.assignedTo);
    }
    
    return matchesSearch && matchesStatus;
  });

  const assignChat = (chatId: string, attendantId: string, attendantName: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, assignedTo: attendantId, assignedToName: attendantName, status: 'assigned' }
        : chat
    ));
    toast({
      title: "Chat atribuído",
      description: `Chat atribuído para ${attendantName}`,
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: ZApiMessage = {
      id: Date.now().toString(),
      instanceId: selectedChat.instanceId,
      from: '551134567890', // Número da empresa
      to: selectedChat.from,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'read'
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? {
            ...chat,
            messages: [...chat.messages, message],
            lastMessage: newMessage,
            timestamp: message.timestamp
          }
        : chat
    ));

    setSelectedChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
      timestamp: message.timestamp
    } : null);

    setNewMessage('');
  };

  const getStatusBadge = (status: Chat['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Aberto</Badge>;
      case 'assigned':
        return <Badge variant="default">Atribuído</Badge>;
      case 'closed':
        return <Badge variant="outline">Fechado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Área de Chats</h1>
        <p className="text-muted-foreground">
          Gerencie e responda conversas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de Chats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="assigned">Atribuídos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredChats.map((chat) => (
              <Card 
                key={chat.id} 
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedChat?.id === chat.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{chat.contactName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{chat.contactName}</h4>
                        <p className="text-sm text-muted-foreground">{chat.from}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {chat.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(chat.status)}
                    {chat.assignedToName && (
                      <span className="text-xs text-primary">{chat.assignedToName}</span>
                    )}
                    {(user?.role === 'Supervisor' || user?.role === 'Dev') && chat.status === 'open' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => assignChat(chat.id, '1', 'João (VA)')}>
                            Atribuir para João (VA)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => assignChat(chat.id, '2', 'Maria (VA)')}>
                            Atribuir para Maria (VA)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{selectedChat.contactName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedChat.contactName}</CardTitle>
                      <CardDescription>{selectedChat.from}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(selectedChat.status)}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.from === selectedChat.from ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.from === selectedChat.from
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage}>Enviar</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa na lista para começar a responder
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;