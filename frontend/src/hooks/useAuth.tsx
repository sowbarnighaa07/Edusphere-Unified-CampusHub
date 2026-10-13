import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSummary } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: UserSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => authService.getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserSummary> => {
    const authData = await authService.login({ email, password });
    setUser(authData.user);
    return authData.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
      } catch {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
