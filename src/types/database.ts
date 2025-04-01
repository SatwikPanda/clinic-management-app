// Enums
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";
export type GenderType = "male" | "female" | "other";
export type BloodGroupType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";
export type PrescriptionStatus =
  | "active"
  | "inactive";

// Doctors Table
export interface Doctor {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience?: string;
  license: string;
  avatar_url?: string;
  password_hash: string;
}

// Patients Table
export interface Patient {
  id?: string;
  created_at?: string;
  name: string;
  email?: string;
  phone?: string | undefined;
  dob?: string;
  gender?: GenderType;
  blood_group?: BloodGroupType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medical_history?: Record<string, any>;
}

// breaks
export interface BreakTime {
  start: string;
  end: string;
  type: string;
}
// Doctor Schedules Table
export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  working_hours: { start: string; end: string };
  breaks: { start: string; end: string; type: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weekly_schedule: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaves: any[];
  created_at: string;
  updated_at: string;
}

// Appointments Table
export interface Appointment {
  id: string;
  created_at?: string;
  confirmation_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  date: string;
  time: string;
  type?: string;
  status: AppointmentStatus;
  notes?: string;
  payment_status?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment_details?: Record<string, any>;
}

// Emergency appointments Table

export interface EmergencyAppointment {
  id: string;
  created_at?: string;
  confirmation_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  date: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  notes?: string;
  payment_status: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment_details?: Record<string, any>;
}

// Prescriptions Table
export interface Prescription {
  id: string;
  created_at: string;
  patient_id: string;
  patient?: Patient;
  doctor_id?: string;
  diagnosis: string;
  notes?: string;
  status?: string;
  medications?: Medication[];
}

// Medications Table
export interface Medication {
  id?: string;
  prescription_id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

// Medical Reports Table
export interface MedicalReport {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  type: string;
  category: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: Record<string, any>;
  description?: string;
}
