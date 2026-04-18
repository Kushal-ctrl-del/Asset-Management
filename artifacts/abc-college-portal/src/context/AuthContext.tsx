import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getItem, removeItem, removeSessionItem, setItem, setSessionItem } from "../lib/storage";
import type { Role, User } from "../types";

type AuthContextValue = {
  currentUser: User | null;
  login: (email: string, password: string, role: Role, remember: boolean) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const tokenKey = "abc_token";
const userKey = "abc_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getItem<User>(userKey));

  useEffect(() => {
    const token = localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
    if (!token) setCurrentUser(null);
  }, []);

  const login = async (email: string, password: string, role: Role, remember: boolean) => {
    const users = getItem<User[]>("abc_users") || [];
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.role === role,
    );
    if (!user) return false;
    const token = `abc-${user.id}-${Date.now()}`;
    if (remember) localStorage.setItem(tokenKey, token);
    else sessionStorage.setItem(tokenKey, token);
    setItem(userKey, user);
    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
    removeItem(userKey);
    removeSessionItem("abc_sidebar_collapsed");
    setCurrentUser(null);
  };

  const updateCurrentUser = (user: User) => {
    const users = getItem<User[]>("abc_users") || [];
    setItem("abc_users", users.map((item) => (item.id === user.id ? user : item)));
    setItem(userKey, user);
    setCurrentUser(user);
  };

  const value = useMemo(
    () => ({ currentUser, login, logout, updateCurrentUser, isAuthenticated: Boolean(currentUser) }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used inside AuthProvider");
  return context;
}
