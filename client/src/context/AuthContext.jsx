import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-logout after 30 min of inactivity
  useEffect(() => {
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const doctorLogin = async (doctorId, password) => {
    const data = await authService.doctorLogin(doctorId, password);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const doctorSignup = async (formData) => {
    const data = await authService.doctorSignup(formData);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const signup = async (formData) => {
    const data = await authService.signup(formData);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeMemberId');
    navigate('/login');
  };

  const currentToken = token || localStorage.getItem('token');
  const storedUserJson = localStorage.getItem('user');
  let currentUser = user;
  if (!currentUser && storedUserJson) {
    try {
      currentUser = JSON.parse(storedUserJson);
    } catch {}
  }

  const isAuthenticated = Boolean(currentToken);
  const isDoctor = currentUser?.role === 'doctor';
  const isPatient = currentUser?.role === 'patient' || !currentUser?.role;

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      token: currentToken,
      loading,
      isAuthenticated,
      isDoctor,
      isPatient,
      login,
      signup,
      doctorLogin,
      doctorSignup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
