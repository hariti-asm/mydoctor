import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Appointment } from '../../../core/models/appointment.model';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-prescription-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="onClose()">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl transform transition-all" (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-emerald-50/30">
          <div>
            <h2 class="text-2xl font-black text-gray-900">Write Prescription</h2>
            <p class="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">Appt #{{ appointment?.id }} • Patient #{{ appointment?.patientId }}</p>
          </div>
          <button (click)="onClose()" class="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form [formGroup]="prescriptionForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          
          <!-- Alert -->
          <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3">
             <div class="text-blue-500 mt-0.5">
               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
             </div>
             <p class="text-sm text-blue-700 leading-relaxed">
               This prescription will be saved to the patient's medical history and **sent immediately via email**.
             </p>
          </div>

          <!-- Diagnosis -->
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Diagnosis</label>
            <input type="text" formControlName="diagnosis" 
                   class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                   placeholder="e.g. Common Cold, Seasonal Allergies">
            <div *ngIf="prescriptionForm.get('diagnosis')?.touched && prescriptionForm.get('diagnosis')?.invalid" class="text-red-500 text-xs font-bold pl-2">
              Diagnosis is required.
            </div>
          </div>

          <!-- Medications -->
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Medications & Dosage</label>
            <textarea formControlName="prescription" rows="4"
                      class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="1. Paracetamol 500mg - 3x/day for 5 days&#10;2. Vitamin C 1000mg - 1x/day"></textarea>
            <div *ngIf="prescriptionForm.get('prescription')?.touched && prescriptionForm.get('prescription')?.invalid" class="text-red-500 text-xs font-bold pl-2">
              At least one medication is required.
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Doctor's Notes (Optional)</label>
            <textarea formControlName="notes" rows="2"
                      class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Rest for 2 days, drink plenty of fluids..."></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 flex space-x-4">
            <button type="button" (click)="onClose()" 
                    class="flex-1 px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button type="submit" [disabled]="prescriptionForm.invalid || loading"
                    class="flex-[2] px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2">
              <span *ngIf="loading">Processing...</span>
              <span *ngIf="!loading">Save & Send Prescription</span>
              <svg *ngIf="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PrescriptionModalComponent {
  @Input() appointment: Appointment | null = null;
  @Output() closed = new EventEmitter<boolean>();

  prescriptionForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private medicalRecordService: MedicalRecordService,
    private authService: AuthService
  ) {
    this.prescriptionForm = this.fb.group({
      diagnosis: ['', Validators.required],
      prescription: ['', Validators.required],
      notes: ['']
    });
  }

  onClose() {
    this.closed.emit(false);
  }

  onSubmit() {
    if (this.prescriptionForm.invalid || !this.appointment) return;

    this.loading = true;
    const formValue = this.prescriptionForm.value;

    const record = {
      patientId: this.appointment.patientId,
      doctorId: this.appointment.doctorId,
      recordDate: new Date().toISOString(),
      diagnosis: formValue.diagnosis,
      prescription: formValue.prescription,
      notes: formValue.notes
    };

    // 1. Fetch Patient Info first
    this.authService.getUserInfo(this.appointment.patientId).subscribe({
      next: (patient) => {
        const patientName = `${patient.firstName} ${patient.lastName || ''}`;
        const patientEmail = patient.email;

        // 2. Save medical record
        this.medicalRecordService.createRecord(record).subscribe({
          next: () => {
            // 3. Send email notification
            this.medicalRecordService.sendPrescriptionEmail({
              to: patientEmail,
              patientName: patientName,
              doctorName: this.authService.getUserName() || 'Your Doctor',
              diagnosis: formValue.diagnosis,
              prescription: formValue.prescription,
              notes: formValue.notes
            }).subscribe({
              next: () => {
                this.loading = false;
                this.closed.emit(true);
              },
              error: () => this.loading = false
            });
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }
}
