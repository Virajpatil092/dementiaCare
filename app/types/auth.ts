export type UserRole = 'patient' | 'caretaker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}