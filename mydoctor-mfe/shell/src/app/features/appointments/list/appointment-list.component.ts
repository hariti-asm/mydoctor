import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  currentUser: any;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe((user: any) => {
      this.currentUser = user;
      if (user) {
        this.loadAppointments(user);
      }
    });
  }

  loadAppointments(user: any): void {
      this.loading = true;
      if (user.role === 'DOCTOR') {
          this.appointmentService.getDoctorAppointments(user.id).subscribe({
              next: (data: Appointment[]) => {
                  this.appointments = data;
                  this.loading = false;
              },
              error: (err: any) => {
                  console.error(err);
                  this.loading = false;
              }
          });
      } else {
          this.appointmentService.getPatientAppointments(user.id).subscribe({
              next: (data: Appointment[]) => {
                  this.appointments = data;
                  this.loading = false;
              },
              error: (err: any) => {
                  console.error(err);
                  this.loading = false;
              }
          });
      }
  }
}
