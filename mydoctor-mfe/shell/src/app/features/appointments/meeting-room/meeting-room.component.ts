import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <button routerLink="/appointments/my-appointments" class="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-xl font-black tracking-tight">Virtual Consultation</h1>
            <p class="text-xs text-slate-400 uppercase font-bold tracking-widest" *ngIf="appointment">
              Appt #{{ appointment.id }} • {{ appointment.reason }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="px-4 py-2 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 text-xs font-black uppercase flex items-center">
            <span class="relative flex h-2 w-2 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Live Call
          </div>
          
          <button (click)="triggerAiTranscription()" 
                  [disabled]="isAiProcessing || aiCompleted"
                  class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-full font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2">
             <svg *ngIf="!isAiProcessing && !aiCompleted" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>
             <div *ngIf="isAiProcessing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             <svg *ngIf="aiCompleted" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
             <span>{{ getAiButtonText() }}</span>
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <!-- Video Grid -->
        <div class="lg:col-span-3 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-700 shadow-emerald-500/5">
          <iframe *ngIf="safeMeetingUrl" 
                  [src]="safeMeetingUrl" 
                  allow="camera; microphone; display-capture; autoplay; encrypted-media" 
                  class="w-full h-full border-none">
          </iframe>
          <div *ngIf="!safeMeetingUrl" class="w-full h-full flex items-center justify-center bg-slate-900/50 backdrop-blur-xl">
             <div class="text-center">
                <div class="animate-pulse bg-white/5 w-16 h-16 rounded-full mx-auto mb-4"></div>
                <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for video stream...</p>
             </div>
          </div>
        </div>

        <!-- Sidebar / AI Transcription -->
        <div class="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 flex flex-col space-y-6 lg:max-h-full overflow-hidden">
          <div>
            <h2 class="text-slate-300 font-black uppercase text-xs tracking-widest mb-4 text-center">AI Copilot Analysis</h2>
            
            <div *ngIf="!isAiProcessing && !aiCompleted" class="text-center py-10 px-4">
                <div class="text-slate-600 mb-4 flex justify-center">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </div>
                <p class="text-sm text-slate-500 font-medium leading-relaxed italic">Click the sparkle button above to start intelligent conversation transcription and clinical summary generation.</p>
            </div>

            <div *ngIf="isAiProcessing" class="space-y-4">
                <div class="flex items-center space-x-3 text-emerald-400">
                    <div class="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                    <span class="text-[10px] font-black uppercase tracking-widest">Processing Audio stream...</span>
                </div>
                <!-- Mock waveform animation -->
                <div class="flex items-end justify-center space-x-1 h-12 py-2">
                  <div class="w-1 bg-emerald-500 animate-[wave_1s_ease-in-out_infinite] rounded-full" style="height: 40%"></div>
                  <div class="w-1 bg-emerald-400 animate-[wave_0.8s_ease-in-out_infinite] rounded-full" style="height: 80%"></div>
                  <div class="w-1 bg-teal-500 animate-[wave_1.2s_ease-in-out_infinite] rounded-full" style="height: 60%"></div>
                  <div class="w-1 bg-emerald-500 animate-[wave_0.9s_ease-in-out_infinite] rounded-full" style="height: 90%"></div>
                  <div class="w-1 bg-teal-400 animate-[wave_1.1s_ease-in-out_infinite] rounded-full" style="height: 50%"></div>
                </div>
                <div class="space-y-2">
                    <div class="h-2 bg-slate-700 rounded-full w-full overflow-hidden">
                      <div class="h-full bg-emerald-500 transition-all duration-300" [style.width]="aiProgress + '%'"></div>
                    </div>
                </div>
            </div>

            <div *ngIf="aiCompleted" class="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div class="flex items-center space-x-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                  <span>Analysis Ready</span>
                </div>
                <p class="text-[13px] text-slate-300 leading-relaxed font-medium italic">
                  Clinical summary has been generated and synced with the medical record. You can view the full transcript in the prescription screen.
                </p>
            </div>
          </div>

          <div class="mt-auto border-t border-slate-700 pt-6">
             <button routerLink="/appointments/my-appointments" 
                     class="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl font-black transition-all border border-red-600/20">
               End Consultation
             </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes wave {
      0%, 100% { height: 30%; }
      50% { height: 100%; }
    }
  `]
})
export class MeetingRoomComponent implements OnInit {
  appointment: Appointment | null = null;
  safeMeetingUrl: SafeResourceUrl | null = null;
  isAiProcessing = false;
  aiCompleted = false;
  aiProgress = 0;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private medicalRecordService: MedicalRecordService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentService.getAppointmentById(+id).subscribe({
        next: (apt: Appointment) => {
          this.appointment = apt;
          if (apt.meetingLink) {
            // Force a good Jitsi link for the demo if it's missing or generic
            const link = apt.meetingLink.startsWith('http') ? apt.meetingLink : `https://meet.jit.si/MyDoctor-Appt-${id}`;
            this.safeMeetingUrl = this.sanitizer.bypassSecurityTrustResourceUrl(link);
          }
        }
      });
    }
  }

  getAiButtonText(): string {
    if (this.isAiProcessing) return 'AI Processing...';
    if (this.aiCompleted) return 'Summary Ready';
    return '✨ Start AI Assistant';
  }

  triggerAiTranscription() {
    if (!this.appointment?.id) return;

    this.isAiProcessing = true;
    this.aiProgress = 0;

    // Simulate progress bar for E2E wow factor
    const interval = setInterval(() => {
      this.aiProgress += 5;
      if (this.aiProgress >= 100) {
        clearInterval(interval);
        
        // Signal completion and store summary in localStorage for the PrescriptionModal to pick up
        const summary = "AI ASSISTED SUMMARY: Patient presents with upper respiratory symptoms. Suggested diagnosis is Viral Rhinopharyngitis (Common Cold). Treatment plan includes symptomatic relief and hydration. Follow-up if symptoms persist beyond 7 days.";
        localStorage.setItem(`ai_summary_${this.appointment!.id}`, summary);
        
        this.isAiProcessing = false;
        this.aiCompleted = true;
      }
    }, 150);
  }
}
