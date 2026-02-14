import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import authService, { User, LoginCredentials } from '../services/authService';
import { registerPushSubscription } from '../utils/pushNotifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const cachedUser = authService.getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
          } else {
            // Fetch user from API
            const fetchedUser = await authService.getCurrentUser();
            setUser(fetchedUser);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
        // Clear invalid token
        await authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register push notifications for Contractor Admin and Property Manager users
  const pushRegisteredRef = useRef(false);
  useEffect(() => {
    if (!user || pushRegisteredRef.current) return;
    const userTypeName = user.user_type?.name;
    const shouldRegisterPush = userTypeName === 'Contractor Admin' || 
                               userTypeName === 'Contractor User' ||
                               userTypeName === 'Property manager';
    if (!shouldRegisterPush) return;

    pushRegisteredRef.current = true;
    registerPushSubscription().catch((err) => console.warn('Push registration skipped:', err));
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser || null);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      pushRegisteredRef.current = false;
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const refreshedUser = await authService.getCurrentUser();
      setUser(refreshedUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};




