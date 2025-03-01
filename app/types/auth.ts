export type UserRole = 'patient' | 'caretaker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  profileImage?: string;
  connectedPatients?: string[]; // IDs of patients connected to caretaker
  caretakerId?: string; // ID of caretaker connected to patient
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  instructions?: string;
  patientId: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: string;
  completed: boolean;
  patientId: string;
}

export interface WalkingRoute {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  patientId: string;
}

export interface FamilyPhoto {
  id: string;
  uri: string;
  title: string;
  description?: string;
  uploadedAt: string;
  patientId: string;
  isLocal?: boolean;
}