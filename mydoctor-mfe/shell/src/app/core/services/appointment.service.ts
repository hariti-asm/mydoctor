import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, CreateAppointmentRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // Pointing to the appointment-service directly for now (port 8082)
  // In a real prod setup, this would go through API Gateway (8080)
  private apiUrl = 'http://localhost:8082/api/v1/appointments';

  constructor(private http: HttpClient) {}

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

  getAvailableSlots(doctorId: number, date: string): Observable<string[]> {
      return this.http.get<string[]>(`${this.apiUrl}/available-slots`, { params: { doctorId: doctorId.toString(), date } });
  }
}
