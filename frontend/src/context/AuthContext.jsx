import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Decode JWT payload
const decodeToken = (token) => {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load and validate it
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded) {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      // Token is valid - restore user from token payload
      setUser({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department,
        name: decoded.name || decoded.email.split('@')[0],
      });
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    console.log('Attempting login with:', email);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isChief: user?.role === 'chief',
    isCitizen: user?.role === 'citizen',
    department: user?.department,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}