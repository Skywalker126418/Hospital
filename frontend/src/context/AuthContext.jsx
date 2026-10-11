import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('hms_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('hms_token', res.token);
      localStorage.setItem('hms_user', JSON.stringify(res.user));
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('hms_token', res.token);
      localStorage.setItem('hms_user', JSON.stringify(res.user));
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const googleLogin = async (payload) => {
    const res = await authService.googleLogin(payload);
    if (res.success && res.token) {
      localStorage.setItem('hms_token', res.token);
      localStorage.setItem('hms_user', JSON.stringify(res.user));
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Google authentication failed.');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateCurrentUser,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
