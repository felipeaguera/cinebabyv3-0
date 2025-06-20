
export interface User {
  id: string;
  email: string;
  type: 'admin' | 'clinic';
  clinicId?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
  password: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  clinic_id: string;
  created_at: string;
  qrCode?: string;
}

export interface Video {
  id: string;
  patient_id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface VideoData {
  id: string;
  patient_id: string;
  file_name: string;
  uploaded_at: string;
  file?: File;
  file_url?: string;
}
