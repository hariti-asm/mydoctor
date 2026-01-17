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
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Book an Appointment
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Select a date and time to see your doctor.
          </p>
        </div>
        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <input type="hidden" name="remember" value="true">
          
          <div class="rounded-md shadow-sm -space-y-px">
            <div class="mb-6">
              <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input formControlName="date" id="date" type="date" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
            </div>

            <div *ngIf="bookingForm.get('date')?.value" class="mb-6">
                 <label class="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                 
                 <div *ngIf="loadingSlots" class="text-sm text-gray-500">Loading slots...</div>
                 
                 <div *ngIf="!loadingSlots && availableSlots.length === 0" class="text-sm text-red-500">
                     No slots available for this date.
                 </div>

                 <div class="grid grid-cols-3 gap-3">
                     <button type="button" *ngFor="let slot of availableSlots" 
                        (click)="selectSlot(slot)"
                        [class.bg-green-600]="selectedSlot === slot"
                        [class.text-white]="selectedSlot === slot"
                        [class.bg-white]="selectedSlot !== slot"
                        [class.text-gray-700]="selectedSlot !== slot"
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-green-50 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                         {{ slot }}
                     </button>
                 </div>
                 <div *ngIf="selectedSlot" class="mt-2 text-sm text-green-600 font-semibold">
                     Selected: {{ selectedSlot }}
                 </div>
            </div>
            
            <div>
              <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea formControlName="reason" id="reason" rows="4" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Describe your symptoms..."></textarea>
            </div>
            
            <div class="flex items-center mt-4">
              <input id="video-call" type="checkbox" formControlName="isVideoCall" class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded">
              <label for="video-call" class="ml-2 block text-sm text-gray-900">
                Request Video Consultation
              </label>
            </div>
          </div>
  
          <div>
            <button type="submit" [disabled]="bookingForm.invalid || !selectedSlot || loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg *ngIf="!loading" class="h-5 w-5 text-green-500 group-hover:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                <svg *ngIf="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Confirm Booking
            </button>
          </div>
          
          <div *ngIf="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  loading = false;
  error = '';
  doctorId: number | null = null;
  currentUser: any;
  
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
