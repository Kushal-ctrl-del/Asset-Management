import React from 'react';
import { Bell, Search, Sun, Moon, Menu, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { NotificationItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuthContext();
  const navigate = useNavigate();
  const [notifications] = useStore<NotificationItem[]>('abc_notifications', []);

  const unreadCount = notifications.filter(n => !n.readBy.includes(currentUser?.id || '')).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted text-slate-600 dark:text-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="pl-9 pr-4 py-2 text-sm bg-muted border-transparent rounded-full focus:bg-background focus:border-border focus:ring-2 focus:ring-ring transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={toggleTheme} className="icon-btn rounded-full border-none shadow-none">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          onClick={() => navigate('/notifications')}
          className="icon-btn rounded-full border-none shadow-none relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          )}
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold">{currentUser?.name}</span>
            <span className="text-xs text-slate-500">{currentUser?.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {currentUser?.name.charAt(0)}
          </div>
          <button onClick={handleLogout} className="icon-btn rounded-full border-none shadow-none ml-1 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
