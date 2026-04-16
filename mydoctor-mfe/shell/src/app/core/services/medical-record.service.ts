import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { MedicalRecord, PrescriptionEmailRequest } from '../models/medical-record.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private recordUrl: string;
  private notifyUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.recordUrl = `${this.configService.apiUrl}/api/v1/medical-records`;
    this.notifyUrl = `${this.configService.apiUrl}/api/v1/notifications`;
  }

  createRecord(record: MedicalRecord): Observable<MedicalRecord> {
    // Save to local storage first for persistence across reloads/portal switches
    this.saveLocalRecord(record);
    
    return this.http.post<MedicalRecord>(this.recordUrl, record).pipe(
      catchError(err => {
        console.warn('Backend failed to save medical record, using local storage fallback', err);
        return of(record);
      })
    );
  }

  private getLocalRecords(): MedicalRecord[] {
    const data = localStorage.getItem('mydoctor_local_records');
    return data ? JSON.parse(data) : [];
  }

  private saveLocalRecord(record: MedicalRecord) {
    const records = this.getLocalRecords();
    const index = records.findIndex(r => r.appointmentId === record.appointmentId);
    if (index > -1) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem('mydoctor_local_records', JSON.stringify(records));
  }

  sendPrescriptionEmail(request: PrescriptionEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.notifyUrl}/prescription`, request);
  }

  getPatientRecords(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.recordUrl}/patient/${patientId}`).pipe(
      catchError(() => {
        // Fallback to local storage if backend is unreachable
        const localRecords = this.getLocalRecords();
        return of(localRecords.filter(r => Number(r.patientId) === Number(patientId)));
      }),
      map((records: MedicalRecord[]) => {
        // Merge with local records, ensuring type-safe ID comparison
        const localRecords = this.getLocalRecords().filter(r => Number(r.patientId) === Number(patientId));
        const merged = [...records];
        localRecords.forEach(lr => {
          if (!merged.find(m => m.appointmentId === lr.appointmentId)) {
            merged.push(lr);
          }
        });
        return merged;
      })
    );
  }

  getRecordByAppointmentId(appointmentId: string): Observable<MedicalRecord | null> {
    return this.http.get<MedicalRecord>(`${this.recordUrl}/appointment/${appointmentId}`).pipe(
      catchError(() => {
        const localRecords = this.getLocalRecords();
        return of(localRecords.find(r => r.appointmentId === appointmentId) || null);
      })
    );
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
