import { useState } from 'react';
import { MessageSquare, Clock, MoreVertical, Search, Filter, Wifi, WifiOff, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useSocket } from '@/hooks/useSocket';

const Chats = () => {
  const { user } = useAuth();
  const { 
    chats, 
    selectedChat, 
    queueChats, 
    assignedChats, 
    setSelectedChat, 
    sendMessage: contextSendMessage, 
    assignChatToVA, 
    returnToQueue,
    markAsRead 
  } = useChat();
  const { isConnected, onlineVAs, setVAStatus } = useSocket();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [vaOnlineStatus, setVaOnlineStatus] = useState(true);

  // Controle de status online do VA
  const toggleVAStatus = () => {
    const newStatus = !vaOnlineStatus;
    setVaOnlineStatus(newStatus);
    setVAStatus(newStatus);
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.from.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleChatSelect = (chat: typeof selectedChat) => {
    setSelectedChat(chat);
    if (chat) {
      markAsRead(chat.id);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    contextSendMessage(newMessage);
    setNewMessage('');
  };

  const getStatusBadge = (status: 'queue' | 'assigned' | 'closed') => {
    switch (status) {
      case 'queue':
        return <Badge variant="secondary">Fila</Badge>;
      case 'assigned':
        return <Badge variant="default">Atribuído</Badge>;
      case 'closed':
        return <Badge variant="outline">Fechado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Área de Chats</h1>
          <p className="text-muted-foreground">
            Gerencie e responda conversas em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status de conexão */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* VAs Online */}
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {onlineVAs.length} VAs online
            </span>
          </div>

          {/* Controle de status para VAs */}
          {user?.role === 'VA' && (
            <Button
              variant={vaOnlineStatus ? "default" : "outline"}
              size="sm"
              onClick={toggleVAStatus}
              className="flex items-center space-x-2"
            >
              <div className={`w-2 h-2 rounded-full ${vaOnlineStatus ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{vaOnlineStatus ? 'Online' : 'Offline'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm font-medium">Fila</span>
            </div>
            <p className="text-2xl font-bold">{queueChats.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium">Atribuídos</span>
            </div>
            <p className="text-2xl font-bold">{assignedChats.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">VAs Online</span>
            </div>
            <p className="text-2xl font-bold">{onlineVAs.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{chats.length}</p>
          </CardContent>
        </Card>
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
                <SelectItem value="queue">Fila</SelectItem>
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
                onClick={() => handleChatSelect(chat)}
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
                    {(user?.role === 'Supervisor' || user?.role === 'Dev') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {chat.status === 'queue' && onlineVAs.map(va => (
                            <DropdownMenuItem 
                              key={va.id} 
                              onClick={() => assignChatToVA(chat.id, va.id, va.name)}
                            >
                              Atribuir para {va.name}
                            </DropdownMenuItem>
                          ))}
                          {chat.status === 'assigned' && (
                            <DropdownMenuItem onClick={() => returnToQueue(chat.id)}>
                              Retornar para fila
                            </DropdownMenuItem>
                          )}
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