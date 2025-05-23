import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/users/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Auth check failed:', error.message);
      // Clear token if it's invalid
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/users/register', {
        username,
        email,
        password,
      });
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return res.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/users/login', {
        email,
        password,
      });
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return res.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        logout,
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