import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html'
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  appointmentId: string | null = null;
  isDoctor = false;
  isMuted = false;
  isVideoOff = false;
  isRemoteJoined = false;

  private mediaRecorder?: MediaRecorder;
  private videoChunks: Blob[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private medicalRecordService: MedicalRecordService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id');
    this.authService.userProfile$.subscribe(profile => {
      this.isDoctor = profile?.role === 'DOCTOR';
    });
    this.startLocalStream();
    
    // Simulate remote user joining after 3 seconds
    setTimeout(() => {
        this.isRemoteJoined = true;
    }, 3000);
  }

  ngOnDestroy(): void {
    this.releaseCamera();
  }

  private releaseCamera() {
    if (this.localVideo?.nativeElement?.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} stopped`);
      });
      this.localVideo.nativeElement.srcObject = null;
    }
    this.mediaRecorder?.stop();
  }

  async startLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
        
        // --- START RECORDING ---
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) this.videoChunks.push(event.data);
        };
        this.mediaRecorder.start();
        // -----------------------
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  }

  toggleAudio() {
    this.isMuted = !this.isMuted;
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    stream.getAudioTracks().forEach(track => track.enabled = !this.isMuted);
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    stream.getVideoTracks().forEach(track => track.enabled = !this.isVideoOff);
  }

  async endCall() {
    // 1. Stop recorder and upload
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
    }
    
    // Create File and Upload
    if (this.appointmentId && this.videoChunks.length > 0) {
        const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
        const file = new File([videoBlob], `call-${this.appointmentId}.webm`);
        
        this.medicalRecordService.uploadRecording(this.appointmentId, file).subscribe({
            next: () => console.log('Recording uploaded successfully'),
            error: (err) => console.error('Failed to upload recording', err)
        });

        // 2. Mark appointment as COMPLETED
        this.appointmentService.completeAppointment(Number(this.appointmentId)).subscribe({
            next: () => console.log('Appointment marked as COMPLETED'),
            error: (err) => console.error('Failed to mark appointment as COMPLETED', err)
        });
    }

    this.releaseCamera();
    window.history.back();
  }
}
