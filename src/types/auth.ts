export interface User {
  id: string;
  username: string;
  role: 'VA' | 'Supervisor' | 'Dev';
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}