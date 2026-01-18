import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalRecord } from '../../../core/models/medical-record.model';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fadeIn">
      <header class="flex justify-between items-center px-4 md:px-0">
        <div>
          <h1 class="text-3xl font-black text-gray-900">Medical History</h1>
          <p class="text-gray-500 font-medium">Review your past consultations and AI summaries.</p>
        </div>
      </header>

      <div *ngIf="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>

      <div *ngIf="!loading && records.length === 0" class="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 mx-4 md:mx-0">
        <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900">No records found</h3>
        <p class="text-gray-500 mt-2">Your medical records will appear here after your first consultation.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 px-4 md:px-0">
        <div *ngFor="let record of records" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <!-- Card Header -->
          <div class="p-6 border-b border-gray-50 bg-emerald-50/20 flex justify-between items-start">
            <div>
              <span class="px-3 py-1 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {{ record.recordDate | date:'fullDate' }}
              </span>
              <h3 class="text-xl font-black text-gray-900 mt-2">{{ record.diagnosis }}</h3>
            </div>
            <div *ngIf="record.recordingUrl" class="flex space-x-2">
                <span class="p-2 bg-green-100 text-green-600 rounded-lg shadow-sm">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
                </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6 flex-1">
            <!-- Prescription -->
            <div class="space-y-2">
              <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Prescription</h4>
              <p class="text-gray-700 font-medium whitespace-pre-line">{{ record.prescription }}</p>
            </div>

            <!-- AI Notes / Conversation Summary -->
            <div *ngIf="record.aiNotes" class="bg-amber-50 rounded-2xl p-4 border border-amber-100">
               <h4 class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4.343 14.243a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707z"></path></svg>
                  Consultation Summary (AI)
               </h4>
               <p class="text-sm text-gray-700 italic leading-relaxed">"{{ record.aiNotes }}"</p>
            </div>

            <!-- Video Player if recording exists -->
            <div *ngIf="record.recordingUrl" class="space-y-2">
               <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Session Recording</h4>
               <div class="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group relative">
                  <video controls class="w-full h-full object-cover">
                    <source [src]="record.recordingUrl" type="video/webm">
                  </video>
               </div>
            </div>

            <!-- Attachments -->
            <div *ngIf="record.attachments?.length" class="space-y-3">
              <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Diagnostic Scans ({{ record.attachments!.length }})</h4>
              <div class="grid grid-cols-4 gap-2">
                <a *ngFor="let url of record.attachments" [href]="url" target="_blank" 
                   class="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 transition-all hover:scale-105 transform">
                  <img [src]="url" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all">
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MedicalHistoryComponent implements OnInit {
  records: MedicalRecord[] = [];
  loading = true;

  constructor(
    private recordService: MedicalRecordService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.loadRecords(profile.id);
      }
    });
  }

  loadRecords(patientId: number) {
    this.recordService.getPatientRecords(patientId).subscribe({
      next: (data: MedicalRecord[]) => {
        this.records = data.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load records', err);
        this.loading = false;
      }
    });
  }
}
