export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type GenderType = 'male' | 'female' | 'other';
export type BloodGroupType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type PrescriptionStatus = 'active' | 'completed';

export interface Doctor {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  license: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: GenderType;
  blood_group?: BloodGroupType;
}

export interface Appointment {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  notes?: string;
  status: PrescriptionStatus;
}

export interface Medication {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface MedicalReport {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string;
  type: string;
  category: string;
  status: string;
  results?: any;
  description?: string;
}

export interface Leave {
  date: string;
  reason: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  working_hours: {
    start: string;
    end: string;
  };
  breaks: Array<{
    start: string;
    end: string;
    type: string;
  }>;
  leaves: Leave[];
  weekly_schedule: Array<{
    day: string;
    slots: string[];
    status?: 'Half Day' | 'Closed';
  }>;
}
