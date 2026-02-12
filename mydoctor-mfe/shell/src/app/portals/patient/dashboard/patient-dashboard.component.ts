import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  joinCall(appointmentId: number): void {
      console.log('Patient joining call for appointment ID:', appointmentId);
      this.router.navigate(['/portal/video-call', appointmentId])
        .then(success => {
            if (success) {
                console.log('Navigation to video call successful');
            } else {
                console.error('Navigation to video call failed');
            }
        })
        .catch(err => {
            console.error('Error during navigation to video call:', err);
        });
  }

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
      const now = new Date();
      const upcoming = apts
        .filter(a => {
          const startTime = new Date(a.startDateTime);
          // Include appointments that are in the future OR started in the last 4 hours
          const isRecentlyStarted = startTime <= now && now <= new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
          return (startTime > now || isRecentlyStarted) && a.status !== 'CANCELLED' && a.status !== 'COMPLETED';
        })
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
      
      this.nextAppointment = upcoming.length > 0 ? upcoming[0] : null;
    });
  }

  isMissed(apt: Appointment): boolean {
    if (!apt || apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    const now = new Date();
    const startTime = new Date(apt.startDateTime);
    // Relaxed for testing: allow joining up to 4 hours after start time
    const expiryTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    return now > expiryTime;
  }
}
