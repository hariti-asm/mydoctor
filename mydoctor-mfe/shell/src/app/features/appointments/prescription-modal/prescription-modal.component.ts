import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Appointment } from '../../../core/models/appointment.model';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalRecord } from '../../../core/models/medical-record.model';

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
            <h2 class="text-2xl font-black text-gray-900">Medical Record & Prescription</h2>
            <p class="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">Appt #{{ appointment?.id }} • Patient #{{ appointment?.patientId }}</p>
          </div>
          <button (click)="onClose()" class="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form [formGroup]="prescriptionForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <!-- AI Transcription Section -->
          <div *ngIf="prescriptionForm.get('aiNotes')?.value" class="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
             <div class="flex items-center space-x-2 text-amber-700 font-black uppercase text-xs tracking-widest">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.001 8.001 0 0117.748 8H12V2.252z"></path></svg>
                <span>AI Transcription Summary</span>
             </div>
             <textarea formControlName="aiNotes" rows="3"
                       class="w-full bg-transparent border-none outline-none text-sm text-amber-900 font-medium italic resize-none"
                       placeholder="AI is processing the conversation..."></textarea>
          </div>

          <!-- Diagnosis -->
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Diagnosis</label>
            <input type="text" formControlName="diagnosis" 
                   class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                   placeholder="e.g. Common Cold, Seasonal Allergies">
          </div>

          <!-- Medications -->
          <div class="space-y-2">
            <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Medications & Dosage</label>
            <textarea formControlName="prescription" rows="3"
                      class="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="1. Paracetamol 500mg..."></textarea>
          </div>

          <!-- Attachments (Radiography/Scans) -->
          <div class="space-y-3">
             <label class="block text-sm font-black text-gray-700 uppercase tracking-wide">Medical Attachments (Scans/Radios)</label>
             <div class="grid grid-cols-3 gap-3">
                <div *ngFor="let url of attachments" class="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img [src]="url" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a [href]="url" target="_blank" class="text-white text-xs font-bold underline">View Full</a>
                    </div>
                </div>
                <label class="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all text-gray-400 hover:text-emerald-500 hover:border-emerald-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span class="text-[10px] font-bold mt-1 uppercase">Add Image</span>
                    <input type="file" (change)="onFileSelected($event)" class="hidden" accept="image/*">
                </label>
             </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 flex space-x-4">
            <button type="button" (click)="onClose()" 
                    class="flex-1 px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button type="submit" [disabled]="prescriptionForm.invalid || loading"
                    class="flex-[2] px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2">
              <span *ngIf="loading">Saving...</span>
              <span *ngIf="!loading">Complete Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class PrescriptionModalComponent implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Output() closed = new EventEmitter<boolean>();

  prescriptionForm: FormGroup;
  loading = false;
  existingRecord: MedicalRecord | null = null;
  attachments: string[] = [];

  constructor(
    private fb: FormBuilder,
    private medicalRecordService: MedicalRecordService,
    private authService: AuthService
  ) {
    this.prescriptionForm = this.fb.group({
      diagnosis: ['', Validators.required],
      prescription: ['', Validators.required],
      notes: [''],
      aiNotes: ['']
    });
  }

  ngOnInit() {
    if (this.appointment?.id) {
      this.loadExistingRecord(this.appointment.id.toString());
    }
  }

  loadExistingRecord(appointmentId: string) {
    this.medicalRecordService.getRecordByAppointmentId(appointmentId).subscribe({
      next: (record) => {
        if (record) {
          this.existingRecord = record;
          this.prescriptionForm.patchValue({
            diagnosis: record.diagnosis,
            prescription: record.prescription,
            notes: record.notes,
            aiNotes: record.aiNotes
          });
          this.attachments = record.attachments || [];
        }
      },
      error: (err) => console.log('No existing record found', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.existingRecord?.id) {
      this.medicalRecordService.uploadAttachment(this.existingRecord.id, file).subscribe({
        next: (url) => {
          this.attachments = [...this.attachments, url];
        },
        error: (err) => console.error('Upload failed', err)
      });
    }
  }

  onClose() {
    this.closed.emit(false);
  }

  onSubmit() {
    if (this.prescriptionForm.invalid || !this.appointment) return;

    this.loading = true;
    const formValue = this.prescriptionForm.value;

    const record: MedicalRecord = {
      id: this.existingRecord?.id,
      appointmentId: this.appointment.id?.toString(),
      patientId: this.appointment.patientId,
      doctorId: this.appointment.doctorId,
      recordDate: this.existingRecord?.recordDate || new Date().toISOString(),
      diagnosis: formValue.diagnosis,
      prescription: formValue.prescription,
      notes: formValue.notes,
      aiNotes: formValue.aiNotes,
      attachments: this.attachments
    };

    this.authService.getUserInfo(this.appointment.patientId).subscribe({
      next: (patient) => {
        const patientName = `${patient.firstName} ${patient.lastName || ''}`;
        const patientEmail = patient.email;

        this.medicalRecordService.createRecord(record).subscribe({
          next: () => {
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
