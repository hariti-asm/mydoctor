import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html'
})
export class DoctorDashboardComponent implements OnInit {
  todaysAppointments: Appointment[] = [];
  upcomingCount = 0;
  totalPatients = 0;
  pendingRequests = 0;

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile && profile.id) {
        this.loadDoctorStats(profile.id);
      }
    });
  }

  loadDoctorStats(doctorId: number): void {
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (apts: any) => {
        const appointments = Array.isArray(apts) ? apts : (apts?.content || []);
        const today = new Date().toDateString();
        const now = new Date();
        
        this.todaysAppointments = appointments.filter((a: any) => 
          a.startDateTime && new Date(a.startDateTime).toDateString() === today
        );
        
        // Use a more lenient 'upcoming' check for demos: anything today or later
        this.upcomingCount = appointments.filter((a: any) => 
          a.startDateTime && (new Date(a.startDateTime) > now || new Date(a.startDateTime).toDateString() === today)
        ).length;
        
        this.pendingRequests = appointments.filter((a: any) => 
          a.status === 'PENDING'
        ).length;
        
        const patientIds = new Set(appointments.map((a: any) => a.patientId));
        this.totalPatients = patientIds.size;
      },
      error: (err) => {
        // Silent fail or basic error handling for UI
      }
    });
  }

  isMissed(apt: Appointment): boolean {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    const now = new Date();
    const startTime = new Date(apt.startDateTime);
    const expiryTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); 
    return now > expiryTime;
  }
}
