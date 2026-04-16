import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateAppointmentRequest } from '../../../core/models/appointment.model';
import { PaymentService } from '../../../core/services/payment.service';
import { StripePaymentComponent } from '../../payment/stripe-payment.component';
import { DoctorSearchService, Doctor } from '../../doctor-search/doctor-search.service';

declare var L: any;

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StripePaymentComponent],
  templateUrl: './booking.component.html'
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  reviewForm: FormGroup;
  loading = false;
  error = '';
  doctorId: number | null = null;
  selectedDoctor: Doctor | null = null;
  doctorLoading = true;
  currentUser: any;
  minDate: string;
  map: any;
  
  availableSlots: string[] = [];
  selectedSlot: string | null = null;
  loadingSlots = false;

  showPayment = false;
  paymentClientSecret = '';
  newBookingId: number | null = null;

  reviews: any[] = [];
  loadingReviews = true;
  submittingReview = false;
  reviewError = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private doctorSearchService: DoctorSearchService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      reason: ['', Validators.required],
      isVideoCall: [false]
    });

    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      text: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
        this.doctorId = +params['doctorId'];
        if (this.doctorId) {
            this.fetchDoctorDetails(this.doctorId);
            this.fetchReviews(this.doctorId);
        }
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

  fetchDoctorDetails(id: number) {
    this.doctorLoading = true;
    this.doctorSearchService.getDoctorById(id).subscribe({
      next: (doctor) => {
        this.selectedDoctor = doctor;
        this.doctorLoading = false;
        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error('Failed to load doctor', err);
        this.doctorLoading = false;
        // Mock fallback if endpoint fails
        if (err.status === 404 || err.status === 0) {
           this.selectedDoctor = {
             id: id,
             firstName: 'System',
             lastName: 'Mock',
             speciality: 'General Practitioner',
             address: '123 Medical Center Blvd',
             city: 'San Francisco',
             latitude: 37.7749,
             longitude: -122.4194,
             rating: 4.8
           };
           setTimeout(() => this.initMap(), 100);
        }
      }
    });
  }

  initMap() {
    if (!this.selectedDoctor || !this.selectedDoctor.latitude || !this.selectedDoctor.longitude) return;
    
    const lat = this.selectedDoctor.latitude;
    const lng = this.selectedDoctor.longitude;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map)
      .bindPopup(`${this.selectedDoctor.firstName} ${this.selectedDoctor.lastName}<br>${this.selectedDoctor.speciality}`)
      .openPopup();
  }

  getDiceBearAvatar(): string {
    if (this.selectedDoctor?.profilePicture) {
      return this.selectedDoctor.profilePicture;
    }
    const seed = `${this.selectedDoctor?.firstName || ''} ${this.selectedDoctor?.lastName || ''}`.trim();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=059669&textColor=ffffff`;
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
      startDateTime: startTime.toISOString().slice(0, 19),
      endDateTime: endTime.toISOString().slice(0, 19),
      reason: this.bookingForm.value.reason,
      appointmentType: this.bookingForm.value.isVideoCall ? 'VIDEO' : 'IN_PERSON'
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: (res: any) => {
        this.newBookingId = res.id;
        this.showPayment = true; // Show payment component for the E2E journey
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

  fetchReviews(id: number) {
    this.loadingReviews = true;
    this.doctorSearchService.getDoctorReviews(id).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.loadingReviews = false;
      }
    });
  }

  onSubmitReview() {
    if (this.reviewForm.invalid || !this.doctorId) return;
    
    this.submittingReview = true;
    this.reviewError = '';

    const reviewPayload = {
       rating: this.reviewForm.value.rating,
       text: this.reviewForm.value.text,
       author: this.currentUser ? `${this.currentUser.firstName} ${this.currentUser.lastName}` : 'Anonymous Patient',
       date: new Date().toLocaleDateString()
    };

    this.doctorSearchService.addDoctorReview(this.doctorId, reviewPayload).subscribe({
      next: (newReview) => {
         this.reviews.push(newReview);
         this.reviewForm.reset({ rating: 5, text: '' });
         this.submittingReview = false;
      },
      error: (err) => {
         console.error('Failed to submit review', err);
         this.reviewError = 'Failed to post review. Please try again.';
         this.submittingReview = false;
      }
    });
  }

  onPaymentSuccess(paymentIntentId: string) {
    if (this.newBookingId) {
      this.appointmentService.confirmAppointment(this.newBookingId).subscribe({
        next: () => {
          this.router.navigate(['/appointments/my-appointments']);
        },
        error: (err: any) => {
          console.error('Failed to confirm appointment after payment', err);
          this.router.navigate(['/appointments/my-appointments']); // Still redirect even if confirm fails
        }
      });
    } else {
      this.router.navigate(['/appointments/my-appointments']);
    }
  }

  onPaymentError(error: string) {
    this.error = error;
  }
}
