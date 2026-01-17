import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentRequest } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  loading = false;
  error = '';
  doctorId: number | null = null;
  currentUser: any;
  minDate: string;
  
  // Slot handling
  availableSlots: string[] = [];
  selectedSlot: string | null = null;
  loadingSlots = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    // Set minDate to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      reason: ['', Validators.required],
      isVideoCall: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
        this.doctorId = +params['doctorId'];
    });
    
    this.authService.userProfile$.subscribe((user: any) => {
        this.currentUser = user;
    });

    // Watch date changes
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
        if (date && this.doctorId) {
            this.loadSlots(date);
        }
    });
  }

  loadSlots(date: string) {
      if (!this.doctorId) return;
      this.loadingSlots = true;
      this.selectedSlot = null; // Reset selection
      this.appointmentService.getAvailableSlots(this.doctorId, date).subscribe({
          next: (slots) => {
              this.availableSlots = slots;
              this.loadingSlots = false;
          },
          error: (err) => {
              console.error(err);
              this.loadingSlots = false;
          }
      });
  }

  selectSlot(slot: string) {
      this.selectedSlot = slot;
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.doctorId || !this.currentUser || !this.selectedSlot) {
      return;
    }

    this.loading = true;
    this.error = '';
    
    const dateStr = this.bookingForm.value.date;
    const timeStr = this.selectedSlot;
    // Combine date and time
    const startTime = new Date(`${dateStr}T${timeStr}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const request: CreateAppointmentRequest = {
      doctorId: this.doctorId,
      patientId: this.currentUser.id,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      reason: this.bookingForm.value.reason,
      appointmentType: (this.bookingForm.value.isVideoCall ? 'VIDEO' : 'IN_PERSON') as 'IN_PERSON' | 'VIDEO'
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.router.navigate(['/appointments/my-appointments']);
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 409) {
             this.error = 'This slot has already been taken. Please choose another one.';
             // Reload slots to refresh view
             this.loadSlots(dateStr);
        } else {
             this.error = 'Failed to book appointment. Please try again.';
        }
        console.error(err);
      }
    });
  }
}
