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
const mockScheduleItems: ScheduleItem[] = [
  { id: '1', time: '08:00 AM', title: 'Morning Medication', type: 'medication', completed: false, patientId: '1' },
  { id: '2', time: '09:30 AM', title: 'Memory Game Session', type: 'activity', completed: false, patientId: '1' },
  { id: '3', time: '10:30 AM', title: 'Morning Walk', type: 'exercise', completed: false, patientId: '1' },
  { id: '4', time: '12:00 PM', title: 'Lunch Time', type: 'meal', completed: false, patientId: '1' },
  { id: '5', time: '02:00 PM', title: 'Afternoon Medication', type: 'medication', completed: false, patientId: '1' },
];
const mockWalkingRoutes: WalkingRoute[] = [
  {
    id: '1',
    name: 'Morning Walk',
    coordinates: [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78925, longitude: -122.4344 },
      { latitude: 37.79025, longitude: -122.4354 },
    ],
    patientId: '1'
  }
];
const mockFamilyPhotos: FamilyPhoto[] = [];
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Memory Match',
    description: 'Match pairs of cards to train your memory',
    difficulty: 'Easy',
    duration: '5-10 min',
    icon: 'Brain',
    patientId: '1'
  },
  {
    id: '2',
    title: 'Word Puzzle',
    description: 'Find hidden words to enhance vocabulary',
    difficulty: 'Medium',
    duration: '10-15 min',
    icon: 'Brain',
    patientId: '1'
  },
  {
    id: '3',
    title: 'Pattern Recognition',
    description: 'Identify and complete patterns',
    difficulty: 'Hard',
    duration: '15-20 min',
    icon: 'Brain',
    patientId: '1'
  }
];

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
      getGames
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