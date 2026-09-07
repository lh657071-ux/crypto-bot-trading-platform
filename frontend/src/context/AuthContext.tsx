import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../lib/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Unable to sign in'));
    }
  }

  async function register(email: string, username: string, password: string, fullName?: string) {
    try {
      const res = await api.post('/auth/register', { email, username, password, fullName });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Unable to create account'));
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
