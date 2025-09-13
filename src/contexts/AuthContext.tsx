import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { getCurrentUser, setCurrentUser, authenticateUser, registerUser } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const authenticatedUser = authenticateUser(email, password);
    if (!authenticatedUser) {
      throw new Error('Invalid email or password');
    }
    
    setUser(authenticatedUser);
    setCurrentUser(authenticatedUser);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const newUser = registerUser(email, password, fullName);
      setUser(newUser);
      setCurrentUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setCurrentUser(null);
  };

  const value = {
    user,
    profile: user, // In this simplified version, user and profile are the same
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};