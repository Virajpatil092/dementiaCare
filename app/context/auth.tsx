import { createContext, useContext, useState } from 'react';
import { AuthState, User, UserRole, Medication, ScheduleItem, WalkingRoute, FamilyPhoto, Game } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  connectToPatient: (patientId: string) => Promise<void>;
  getPatientDetails: (patientId: string) => User | null;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  getMedications: (patientId: string) => Medication[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => Promise<void>;
  getSchedule: (patientId: string) => ScheduleItem[];
  addWalkingRoute: (route: Omit<WalkingRoute, 'id'>) => Promise<void>;
  getWalkingRoutes: (patientId: string) => WalkingRoute[];
  addFamilyPhoto: (photo: Omit<FamilyPhoto, 'id'>) => Promise<void>;
  getFamilyPhotos: (patientId: string) => FamilyPhoto[];
  updateScheduleItemStatus: (itemId: string, completed: boolean) => Promise<void>;
  addGame: (game: Omit<Game, 'id'>) => Promise<void>;
  getGames: (patientId: string) => Game[];
  updateGame: (gameId: string, gameData: Partial<Game>) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
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
    name: 'Sarah Caretaker',
    connectedPatients: ['1']
  }
};

// Mock data storage
const mockMedications: Medication[] = [];
const mockScheduleItems: ScheduleItem[] = [];
const mockWalkingRoutes: WalkingRoute[] = [];
const mockFamilyPhotos: FamilyPhoto[] = [];
const mockGames: Game[] = [];

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
        ...(role === 'caretaker' ? { connectedPatients: [] } : {})
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

  const connectToPatient = async (patientId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find patient by ID
      const patientEntry = Object.entries(mockUsers).find(([_, user]) => user.id === patientId);
      
      if (!patientEntry || patientEntry[1].role !== 'patient') {
        throw new Error('Patient not found');
      }
      
      const [patientEmail, patient] = patientEntry;
      
      // Update caretaker's connected patients
      if (state.user && state.user.role === 'caretaker') {
        const updatedUser = {
          ...state.user,
          connectedPatients: [...(state.user.connectedPatients || []), patientId]
        };
        
        // Update the mock user data
        if (mockUsers[state.user.email]) {
          mockUsers[state.user.email] = {
            ...mockUsers[state.user.email],
            connectedPatients: [...(mockUsers[state.user.email].connectedPatients || []), patientId]
          };
        }
        
        // Update patient's caretaker ID
        mockUsers[patientEmail] = {
          ...patient,
          caretakerId: state.user.id
        };
        
        setState({
          user: updatedUser,
          loading: false,
          error: null,
        });
      } else {
        throw new Error('Only caretakers can connect to patients');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to connect to patient',
      }));
    }
  };

  const getPatientDetails = (patientId: string): User | null => {
    const patientEntry = Object.entries(mockUsers).find(([_, user]) => user.id === patientId);
    if (!patientEntry) return null;
    
    const [_, patient] = patientEntry;
    const { password, ...patientData } = patient;
    return patientData;
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMedication: Medication = {
        ...medication,
        id: Math.random().toString(),
      };
      
      mockMedications.push(newMedication);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add medication',
      }));
    }
  };

  const getMedications = (patientId: string): Medication[] => {
    return mockMedications.filter(med => med.patientId === patientId);
  };

  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newItem: ScheduleItem = {
        ...item,
        id: Math.random().toString(),
      };
      
      mockScheduleItems.push(newItem);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add schedule item',
      }));
    }
  };

  const getSchedule = (patientId: string): ScheduleItem[] => {
    return mockScheduleItems.filter(item => item.patientId === patientId);
  };

  const updateScheduleItemStatus = async (itemId: string, completed: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const itemIndex = mockScheduleItems.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        mockScheduleItems[itemIndex] = {
          ...mockScheduleItems[itemIndex],
          completed
        };
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update schedule item',
      }));
    }
  };

  const addWalkingRoute = async (route: Omit<WalkingRoute, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newRoute: WalkingRoute = {
        ...route,
        id: Math.random().toString(),
      };
      
      mockWalkingRoutes.push(newRoute);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add walking route',
      }));
    }
  };

  const getWalkingRoutes = (patientId: string): WalkingRoute[] => {
    return mockWalkingRoutes.filter(route => route.patientId === patientId);
  };

  const addFamilyPhoto = async (photo: Omit<FamilyPhoto, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPhoto: FamilyPhoto = {
        ...photo,
        id: Math.random().toString(),
      };
      
      mockFamilyPhotos.push(newPhoto);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add family photo',
      }));
    }
  };

  const getFamilyPhotos = (patientId: string): FamilyPhoto[] => {
    return mockFamilyPhotos.filter(photo => photo.patientId === patientId);
  };

  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newGame: Game = {
        ...game,
        id: Math.random().toString(),
      };
      
      mockGames.push(newGame);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add game',
      }));
    }
  };

  const updateGame = async (gameId: string, gameData: Partial<Game>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const gameIndex = mockGames.findIndex(game => game.id === gameId);
      if (gameIndex !== -1) {
        mockGames[gameIndex] = {
          ...mockGames[gameIndex],
          ...gameData
        };
      } else {
        throw new Error('Game not found');
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update game',
      }));
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const gameIndex = mockGames.findIndex(game => game.id === gameId);
      if (gameIndex !== -1) {
        mockGames.splice(gameIndex, 1);
      } else {
        throw new Error('Game not found');
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete game',
      }));
    }
  };

  const getGames = (patientId: string): Game[] => {
    return mockGames.filter(game => game.patientId === patientId);
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      signIn, 
      signUp, 
      signOut,
      connectToPatient,
      getPatientDetails,
      addMedication,
      getMedications,
      addScheduleItem,
      getSchedule,
      addWalkingRoute,
      getWalkingRoutes,
      addFamilyPhoto,
      getFamilyPhotos,
      updateScheduleItemStatus,
      addGame,
      getGames,
      updateGame,
      deleteGame
    }}>
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