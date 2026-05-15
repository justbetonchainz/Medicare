export type Role = 'patient' | 'doctor' | 'admin';
export type Gender = 'male' | 'female' | 'other';
export type DoctorStatus = 'active' | 'inactive';
export type AvailabilityStatus = 'available' | 'booked';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

export interface Doctor {
  id: string;
  userId: string;
  specialtyId: string | null;
  orderNumber: string | null;
  bio: string | null;
  status: DoctorStatus;
  user: User;
  specialty: Specialty | null;
}

export interface Patient {
  id: string;
  userId: string;
  birthDate: string | null;
  address: string | null;
  gender: Gender | null;
  user?: User;
}

export interface Availability {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  availabilityId: string | null;
  appointmentDate: string;
  appointmentTime: string;
  reason: string | null;
  status: AppointmentStatus;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  perSpecialty: Array<{ specialtyId: string; name: string; doctors: number }>;
  recentAppointments: Appointment[];
}

export interface DoctorStats {
  todayAppointments: number;
  upcomingAppointments: number;
  totalAppointments: number;
}
