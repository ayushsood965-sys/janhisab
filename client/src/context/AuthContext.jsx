import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, signupUser, verifyEmailOtp, verifyNagrikUpi, verifyUserApplication } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('janhisab_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('Session expired or invalid token');
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
      localStorage.setItem('janhisab_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const signup = async (userData) => {
    const res = await signupUser(userData);
    return res.data;
  };

  const verifyEmail = async (emailOrHandle, otp) => {
    const res = await verifyEmailOtp({
      email: emailOrHandle.includes('@') ? emailOrHandle : undefined,
      handle: !emailOrHandle.includes('@') ? emailOrHandle : undefined,
      otp,
    });
    if (res.data.success) {
      localStorage.setItem('janhisab_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
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
        verifyEmail,
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
