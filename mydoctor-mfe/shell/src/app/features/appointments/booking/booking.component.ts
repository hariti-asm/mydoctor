import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentRequest } from '../../../core/models/appointment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { StripePaymentComponent } from '../../payment/stripe-payment.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StripePaymentComponent],
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  loading = false;
  error = '';
  doctorId: number | null = null;
  currentUser: any;
  minDate: string;
  
  availableSlots: string[] = [];
  selectedSlot: string | null = null;
  loadingSlots = false;

  showPayment = false;
  paymentClientSecret = '';
  newBookingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {
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

    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
        if (date && this.doctorId) {
            this.loadSlots(date);
        }
    });
  }

  loadSlots(date: string) {
      if (!this.doctorId) return;
      this.loadingSlots = true;
      this.selectedSlot = null;
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

    const startTime = new Date(`${dateStr}T${timeStr}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const request: CreateAppointmentRequest = {
      doctorId: this.doctorId,
      patientId: this.currentUser.id,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
      reason: this.bookingForm.value.reason,
      appointmentType: this.bookingForm.value.isVideoCall ? 'VIDEO' : 'IN_PERSON'
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: (res: any) => {
        console.log('Appointment created successfully, skipping payment as requested');
        this.router.navigate(['/appointments/my-appointments']);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 409) {
             this.error = 'This slot has already been taken. Please choose another one.';
             this.loadSlots(dateStr);
        } else {
             this.error = 'Failed to book appointment. Please try again.';
        }
        console.error(err);
      }
    });
  }

  onPaymentSuccess(paymentIntentId: string) {
  }

  onPaymentError(error: string) {
  }
}
