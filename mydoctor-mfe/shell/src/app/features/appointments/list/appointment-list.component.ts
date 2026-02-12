import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';

import { RouterModule, Router } from '@angular/router';
import { PrescriptionModalComponent } from '../prescription-modal/prescription-modal.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PrescriptionModalComponent],
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  currentUser: any;
  selectedAppointment: Appointment | null = null;
  isModalOpen = false;
  isPrescriptionModalOpen = false;
  appointmentToPrescribe: Appointment | null = null;
  participantNames: { [key: number]: string } = {};

  isMissed(apt: Appointment): boolean {
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') return false;
    const now = new Date();
    const startTime = new Date(apt.startDateTime);
    // Relaxed for testing: allow joining up to 4 hours after start time
    const expiryTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    return now > expiryTime;
  }

  openDetails(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.isModalOpen = true;
  }

  getMissedExplanation(apt: Appointment): string {
    if (!this.isMissed(apt)) return '';
    
    const now = new Date();
    const startTime = new Date(apt.startDateTime);
    const diffHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (apt.appointmentType === 'VIDEO') {
        const expiryTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
        return `This video consultation was scheduled for ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. It is marked as missed because the 4-hour join window (until ${expiryTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}) has expired.`;
    }
    
    if (diffHours > 24) {
        return `This appointment was scheduled over 24 hours ago. It is marked as missed because it was not flagged as COMPLETED within the standard 24-hour window.`;
    }

    return `This appointment time has passed. It is marked as missed because it remains in ${apt.status} state despite the scheduled time having elapsed.`;
  }

  closeDetails(): void {
    this.isModalOpen = false;
    this.selectedAppointment = null;
  }

  openPrescription(apt: Appointment): void {
    this.appointmentToPrescribe = apt;
    this.isPrescriptionModalOpen = true;
  }

  onPrescriptionClosed(success: boolean): void {
    this.isPrescriptionModalOpen = false;
    this.appointmentToPrescribe = null;
    if (success) {
      // Reload or show success message if needed
      this.loadAppointments(this.currentUser);
    }
  }

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  joinCall(appointmentId: number): void {
      console.log('Joining call for appointment ID:', appointmentId);
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
                  this.fetchParticipantNames(data, 'PATIENT');
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
                  this.fetchParticipantNames(data, 'DOCTOR');
                  this.loading = false;
              },
              error: (err: any) => {
                  console.error(err);
                  this.loading = false;
              }
          });
      }
  }

  fetchParticipantNames(appointments: Appointment[], targetRole: 'DOCTOR' | 'PATIENT'): void {
    const ids = targetRole === 'DOCTOR' ? appointments.map(a => a.doctorId) : appointments.map(a => a.patientId);
    const uniqueIds = [...new Set(ids)];
    
    uniqueIds.forEach(id => {
      if (!this.participantNames[id]) {
        this.authService.getUserInfo(id).subscribe({
          next: (profile) => {
            this.participantNames[id] = `${profile.firstName} ${profile.lastName}`;
          },
          error: (err) => {
            console.error(`Failed to fetch name for ID ${id}`, err);
            this.participantNames[id] = `${targetRole === 'DOCTOR' ? 'Dr.' : 'Patient'} #${id}`;
          }
        });
      }
    });
  }
}
