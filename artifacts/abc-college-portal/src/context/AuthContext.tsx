import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getItem, setItem, removeItem, getSessionItem, setSessionItem, removeSessionItem } from '../lib/storage';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User, rememberMe: boolean) => void;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = getItem<string>('abc_token');
    const sessionToken = getSessionItem<string>('abc_token');
    const user = getItem<User>('abc_current_user');

    if ((localToken || sessionToken) && user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
      removeItem('abc_current_user');
      removeItem('abc_token');
      removeSessionItem('abc_token');
    }
    setLoading(false);
  }, []);

  const login = (user: User, rememberMe: boolean) => {
    const token = `abc-${user.id}-${Date.now()}`;
    if (rememberMe) {
      setItem('abc_token', token);
    } else {
      setSessionItem('abc_token', token);
    }
    setItem('abc_current_user', user);
    setCurrentUser(user);
  };

  const logout = () => {
    removeItem('abc_token');
    removeSessionItem('abc_token');
    removeItem('abc_current_user');
    removeSessionItem('abc_sidebar_collapsed');
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedUser: User) => {
    setItem('abc_current_user', updatedUser);
    setCurrentUser(updatedUser);
    
    // Also update in abc_users
    const users = getItem<User[]>('abc_users') || [];
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      setItem('abc_users', users);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
