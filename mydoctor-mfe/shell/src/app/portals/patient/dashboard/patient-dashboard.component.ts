import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.component.html'
})
export class PatientDashboardComponent implements OnInit {
  nextAppointment: Appointment | null = null;
  totalAppointments = 0;

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.loadStats(profile.id);
      }
    });
  }

  loadStats(userId: number): void {
    this.appointmentService.getPatientAppointments(userId).subscribe(apts => {
      this.totalAppointments = apts.length;
      const upcoming = apts
        .filter(a => new Date(a.startDateTime) > new Date() && a.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
      
      this.nextAppointment = upcoming.length > 0 ? upcoming[0] : null;
    });
  }

  isMissed(apt: Appointment): boolean {
    if (!apt || apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    return new Date(apt.startDateTime) < new Date();
  }
}
