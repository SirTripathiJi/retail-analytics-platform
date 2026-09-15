import { createContext, useContext, useEffect, useState } from 'react';

import { DB } from '../services/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = DB.getSession();
      if (session && (session.uid || session.id)) {
        setUser(session);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    DB.setSession(userData);
    setUser(userData);
  };

  const logout = () => {
    DB.clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
