import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  name: string;
  role: string;
  farm: string;
  email: string;
  phone: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DUMMY_USER: User = {
  username: 'admin',
  name: 'Rajesh Kumar',
  role: 'Farm Manager',
  farm: 'Sunrise Aqua Farm',
  email: 'rajesh@sunriseaqua.com',
  phone: '+91 98765 43210',
  location: 'Nellore, Andhra Pradesh',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      setUser(DUMMY_USER);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
