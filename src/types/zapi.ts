export interface ZApiInstance {
  id: string;
  name: string;
  instanceId: string;
  token: string;
  apiUrl: string;
  status: 'connected' | 'disconnected' | 'error';
  createdAt: string;
  lastActivity?: string;
}

export interface ZApiMessage {
  id: string;
  instanceId: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio';
  status: 'received' | 'read';
  assignedTo?: string;
}

export interface ZApiWebhookPayload {
  instanceId: string;
  from: string;
  to: string;
  message: {
    text?: string;
    image?: string;
    document?: string;
    audio?: string;
  };
  timestamp: string;
  messageId: string;
}