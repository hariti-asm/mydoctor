export interface MedicalRecord {
    id?: number;
    patientId: number;
    doctorId: number;
    recordDate: string;
    diagnosis: string;
    prescription: string;
    notes?: string;
}

export interface PrescriptionEmailRequest {
    to: string;
    patientName: string;
    doctorName: string;
    diagnosis: string;
    prescription: string;
    notes: string;
}
