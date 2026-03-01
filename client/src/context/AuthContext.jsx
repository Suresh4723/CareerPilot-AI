import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (payload) => {
    const { data } = await axiosInstance.post('/auth/login', payload);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await axiosInstance.post('/auth/register', payload);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await axiosInstance.post('/auth/logout');
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await axiosInstance.put('/auth/profile', payload);
    setUser(data.user);
    return data;
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, refresh: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
