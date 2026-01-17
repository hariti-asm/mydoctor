export interface Appointment {
  id?: number;
  doctorId: number;
  patientId: number;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  appointmentType: 'IN_PERSON' | 'VIDEO';
  reason: string;
  notes?: string;
  doctorName?: string; // Optional for UI convenience if we merge data
}

export interface CreateAppointmentRequest {
  doctorId: number;
  patientId: number;
  startDateTime: string;
  endDateTime: string;
  appointmentType: 'IN_PERSON' | 'VIDEO';
  reason: string;
}
