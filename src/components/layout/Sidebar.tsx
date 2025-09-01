import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Atendentes', href: '/attendants', icon: Users },
  { name: 'Chats', href: '/chats', icon: MessageSquare },
  { name: 'Z-API Config', href: '/zapi-config', icon: Zap },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className={cn(
      "bg-[hsl(var(--sidebar-bg))] text-white transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-hover))]">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">PC</span>
              </div>
              <h1 className="text-lg font-semibold">PrestusChats</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-[hsl(var(--sidebar-hover))] p-2"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-[hsl(var(--sidebar-hover))]",
                isActive ? "bg-primary text-primary-foreground" : "text-white/80 hover:text-white"
              )}
            >
              <item.icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3")} />
              {!isCollapsed && item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-hover))]">
        {!isCollapsed && user && (
          <div className="mb-4 text-sm">
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-white/60">{user.role}</p>
          </div>
        )}
        <Button
          onClick={logout}
          variant="ghost"
          className={cn(
            "text-white hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
            isCollapsed ? "w-full p-2" : "w-full justify-start"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sair"}
        </Button>
      </div>
    </div>
  );
};