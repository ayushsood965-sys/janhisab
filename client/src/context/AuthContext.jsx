import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getMe,
  loginUser,
  signupUser,
  verifyEmailToken,
  resendVerificationEmail,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  verifyNagrikUpi,
  verifyUserApplication,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('janaudit_token') || localStorage.getItem('janhisab_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('janaudit_token');
          localStorage.removeItem('janhisab_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await loginUser({ identifier, password });
    if (res.data.success) {
      localStorage.setItem('janaudit_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const signup = async (userData) => {
    const res = await signupUser(userData);
    return res.data;
  };

  const verifyEmailByToken = async (tokenString) => {
    const res = await verifyEmailToken(tokenString);
    if (res.data.success) {
      localStorage.setItem('janaudit_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const resendVerification = async (email) => {
    const res = await resendVerificationEmail(email);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await apiForgotPassword(email);
    return res.data;
  };

  const resetPassword = async (tokenString, newPassword) => {
    const res = await apiResetPassword(tokenString, newPassword);
    if (res.data.success && res.data.token) {
      localStorage.setItem('janaudit_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('janaudit_token');
    localStorage.removeItem('janhisab_token');
    setToken(null);
    setUser(null);
  };

  const verifyUpi = async () => {
    const res = await verifyNagrikUpi();
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const adminApproveUser = async (targetUserId) => {
    const res = await verifyUserApplication({ targetUserId, action: 'APPROVE' });
    return res.data;
  };

  const adminRejectUser = async (targetUserId) => {
    const res = await verifyUserApplication({ targetUserId, action: 'REJECT' });
    return res.data;
  };

  const updateUserPoints = (newJantaPoints, newKarmaTier) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        jantaPoints: newJantaPoints !== undefined ? newJantaPoints : prev.jantaPoints,
        karmaTier: newKarmaTier || prev.karmaTier,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        register: signup,
        verifyEmail: verifyEmailByToken,
        verifyEmailByToken,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        verifyUpi,
        adminApproveUser,
        adminRejectUser,
        updateUserPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
