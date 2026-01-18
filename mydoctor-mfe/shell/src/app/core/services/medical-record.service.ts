import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalRecord, PrescriptionEmailRequest } from '../models/medical-record.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private recordUrl = 'http://localhost:9000/api/v1/medical-records';
  private notifyUrl = 'http://localhost:9000/api/v1/notifications';

  constructor(private http: HttpClient) {}

  createRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(this.recordUrl, record);
  }

  sendPrescriptionEmail(request: PrescriptionEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.notifyUrl}/prescription`, request);
  }

  getPatientRecords(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.recordUrl}/patient/${patientId}`);
  }

  getRecordByAppointmentId(appointmentId: string): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.recordUrl}/appointment/${appointmentId}`);
  }

  uploadRecording(appointmentId: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.recordUrl}/upload-recording/${appointmentId}`, formData);
  }

  uploadAttachment(recordId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.recordUrl}/${recordId}/attachments`, formData, { responseType: 'text' as 'json' });
  }
}
