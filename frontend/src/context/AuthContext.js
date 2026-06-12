import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const userData = response.user;
      if (userData && userData.fullName && !userData.name) {
        userData.name = userData.fullName;
      }
      setUser(userData);
      toast.success('Đăng nhập thành công!');
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
      throw error;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await authService.register(data);
      toast.success('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success('Đã đăng xuất.');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    if (updatedUser && updatedUser.fullName && !updatedUser.name) {
      updatedUser.name = updatedUser.fullName;
    }
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
