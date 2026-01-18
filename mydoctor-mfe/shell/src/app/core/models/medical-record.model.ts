export interface MedicalRecord {
    id?: number;
    appointmentId?: string;
    patientId: number;
    doctorId: number;
    recordDate: string;
    diagnosis: string;
    prescription: string;
    notes?: string;
    recordingUrl?: string;
    aiNotes?: string;
    attachments?: string[];
}

export interface PrescriptionEmailRequest {
    to: string;
    patientName: string;
    doctorName: string;
    diagnosis: string;
    prescription: string;
    notes: string;
}
