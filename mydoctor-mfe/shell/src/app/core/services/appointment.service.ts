import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, CreateAppointmentRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = `${this.configService.apiUrl}/api/v1/appointments`;
  }

  createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, request);
  }

  getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getPatientAppointments(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  updateStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, {}, { params: { status } });
  }

  completeAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/complete`, {});
  }

  getAvailableSlots(doctorId: number, date: string): Observable<string[]> {
      return this.http.get<string[]>(`${this.apiUrl}/available-slots`, { params: { doctorId: doctorId.toString(), date } });
  }
}
