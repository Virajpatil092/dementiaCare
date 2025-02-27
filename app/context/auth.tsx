import { createContext, useContext, useState } from 'react';
import { AuthState, User, UserRole } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Mock users for development
const mockUsers: Record<string, { password: string } & User> = {
  'patient@example.com': {
    id: '1',
    email: 'patient@example.com',
    password: 'password123',
    role: 'patient',
    name: 'John Patient'
  },
  'caretaker@example.com': {
    id: '2',
    email: 'caretaker@example.com',
    password: 'password123',
    role: 'caretaker',
    name: 'Sarah Caretaker'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers[email];
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials');
      }

      const { password: _, ...userData } = user;
      setState({
        user: userData,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid email or password',
      }));
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, name: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (mockUsers[email]) {
        throw new Error('Email already exists');
      }

      const newUser = {
        id: Math.random().toString(),
        email,
        password,
        role,
        name,
      };

      mockUsers[email] = newUser;
      
      const { password: _, ...userData } = newUser;
      setState({
        user: userData,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to create account',
      }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out',
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}