
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
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  clinicId: string;
  createdAt: string;
  qrCode?: string;
}

export interface Video {
  id: string;
  patientId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}
