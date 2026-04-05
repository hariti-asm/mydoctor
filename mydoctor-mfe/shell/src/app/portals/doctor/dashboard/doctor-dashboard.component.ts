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
      if (profile) {
        this.loadDoctorStats(profile.id);
      }
    });
  }

  loadDoctorStats(doctorId: number): void {
     this.appointmentService.getDoctorAppointments(doctorId).subscribe(apts => {
         const today = new Date().toDateString();
         this.todaysAppointments = apts.filter(a => new Date(a.startDateTime).toDateString() === today);
         this.upcomingCount = apts.filter(a => new Date(a.startDateTime) > new Date()).length;
         this.pendingRequests = apts.filter(a => a.status === 'PENDING').length;
         
         // Total unique patients (mock logic since we only have IDs)
         const patientIds = new Set(apts.map(a => a.patientId));
         this.totalPatients = patientIds.size;
     });
  }

  isMissed(apt: Appointment): boolean {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    const now = new Date();
    const startTime = new Date(apt.startDateTime);
    // Relaxed for testing: allow joining up to 4 hours after start time
    const expiryTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); 
    return now > expiryTime;
  }
}
