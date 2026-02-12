import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { SignalingService, WebRTCMessage } from '../../core/services/signaling.service';
import { Subscription, Observable, firstValueFrom as firstValueFromRxjs, filter, take } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html'
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  appointmentId: string | null = null;
  isDoctor = false;
  userEmail = '';
  isMuted = false;
  isVideoOff = false;
  isRemoteJoined = false;
  mediaUnavailable = false;

  private peerConnection?: RTCPeerConnection;
  private localStream?: MediaStream;
  private signalingSubscription?: Subscription;
  private mediaRecorder?: MediaRecorder;
  private videoChunks: Blob[] = [];
  private viewReady = false;
  private profileReady = false;

  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private medicalRecordService: MedicalRecordService,
    private appointmentService: AppointmentService,
    private signalingService: SignalingService
  ) {}

  ngOnInit() {
    this.appointmentId = this.route.snapshot.paramMap.get('id');

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.isDoctor = profile.role === 'DOCTOR';
        this.userEmail = profile.email;
        this.profileReady = true;
        this.tryInitCall();
      }
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.tryInitCall();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Only start the call once BOTH the view is ready (@ViewChild available)
   * AND the user profile has loaded.
   */
  private tryInitCall() {
    if (this.viewReady && this.profileReady && this.appointmentId) {
      this.initCall();
    }
  }

  private async initCall() {
    if (!this.appointmentId) return;

    // Start local stream — view is guaranteed ready so localVideo element exists
    await this.startLocalStream();

    // Connect to signaling server
    this.signalingService.connect(this.appointmentId);

    // Listen for messages
    this.signalingSubscription = this.signalingService.onMessage().subscribe(msg => {
      this.handleSignalingMessage(msg);
    });

    // Wait for signaling connection to be established
    console.log('Waiting for signaling connection...');
    await firstValueFromRxjs(
      this.signalingService.connected$.pipe(
        filter(connected => connected === true),
        take(1)
      )
    );
    console.log('Signaling connected, setting up peer connection and joining...');

    this.setupPeerConnection();

    // Send join message to announce presence
    this.signalingService.sendSignal({
      type: 'join',
      data: { role: this.isDoctor ? 'DOCTOR' : 'PATIENT' },
      sender: this.userEmail,
      appointmentId: this.appointmentId
    });
  }

  private setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
        this.isRemoteJoined = true;
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.appointmentId) {
        this.signalingService.sendSignal({
          type: 'candidate',
          data: event.candidate,
          sender: this.userEmail,
          appointmentId: this.appointmentId
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
          this.isRemoteJoined = true;
      }
    };
  }

  private async initiateCall() {
    if (!this.peerConnection || !this.appointmentId) return;

    console.log('Creating offer...');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.signalingService.sendSignal({
      type: 'offer',
      data: offer,
      sender: this.userEmail,
      appointmentId: this.appointmentId
    });
  }

  private async handleSignalingMessage(msg: WebRTCMessage) {
    if (msg.sender === this.userEmail) return; // Ignore own messages

    console.log('Received signaling message:', msg.type, 'from:', msg.sender);

    switch (msg.type) {
      case 'join':
        this.handleJoin(msg);
        break;
      case 'offer':
        await this.handleOffer(msg.data);
        break;
      case 'answer':
        await this.handleAnswer(msg.data);
        break;
      case 'candidate':
        await this.handleCandidate(msg.data);
        break;
    }
  }

  /**
   * When someone joins, the DOCTOR always creates the offer.
   * The patient does NOT send a join back — that would create an infinite loop.
   */
  private handleJoin(msg: WebRTCMessage) {
    console.log('Participant joined:', msg.sender, 'role:', msg.data?.role);
    if (this.isDoctor) {
      // Doctor creates the offer when someone (patient) joins
      console.log('I am the doctor, creating offer for the patient...');
      this.initiateCall();
    }
    // Patient does nothing here — they wait for the offer from the doctor.
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection || !this.appointmentId) return;

    console.log('Received offer, creating answer...');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.signalingService.sendSignal({
      type: 'answer',
      data: answer,
      sender: this.userEmail,
      appointmentId: this.appointmentId
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    console.log('Received answer, setting remote description...');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  }

  private async startLocalStream() {
    // navigator.mediaDevices is only available in secure contexts (HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Media devices API not available. The page must be served over HTTPS or localhost.');
      this.mediaUnavailable = true;
      this.isVideoOff = true;
      return;
    }

    try {
      console.log('Requesting camera/microphone access...');
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Media stream acquired, tracks:', this.localStream.getTracks().map(t => t.kind));

      // localVideo is guaranteed to exist because we wait for AfterViewInit
      this.localVideo.nativeElement.srcObject = this.localStream;
      // Force play to handle autoplay restrictions
      this.localVideo.nativeElement.play().catch(e => console.warn('Autoplay blocked:', e));
      console.log('Attached local stream to video element');

      // --- START RECORDING ---
      this.mediaRecorder = new MediaRecorder(this.localStream);
      this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) this.videoChunks.push(event.data);
      };
      this.mediaRecorder.start();
      // -----------------------
    } catch (err) {
      console.error('Error accessing media devices:', err);
      // Attempt audio only if video fails
      try {
        console.log('Attempting audio-only stream...');
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        this.isVideoOff = true;
      } catch (audioErr) {
        console.error('Audio-only access also failed:', audioErr);
      }
    }
  }

  toggleAudio() {
    this.isMuted = !this.isMuted;
    this.localStream?.getAudioTracks().forEach(track => track.enabled = !this.isMuted);
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    this.localStream?.getVideoTracks().forEach(track => track.enabled = !this.isVideoOff);
  }

  async endCall() {
    console.log('Ending call process...');

    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
          // Small delay to ensure the stop event is processed and chunks are finalized
          await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (this.appointmentId && this.videoChunks.length > 0) {
          try {
              const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
              const file = new File([videoBlob], `call-${this.appointmentId}.webm`);

              console.log('Uploading recording...');
              await firstValueFrom(this.medicalRecordService.uploadRecording(this.appointmentId, file))
                .catch(err => console.error('Failed to upload recording:', err));

              console.log('Completing appointment...');
              await firstValueFrom(this.appointmentService.completeAppointment(Number(this.appointmentId)))
                .catch(err => console.error('Failed to complete appointment:', err));

              console.log('Call finalization steps initiated');
          } catch (err) {
              console.error('Error during call finalization cleanup:', err);
          }
      }
    } catch (err) {
      console.error('Critical error in endCall:', err);
    } finally {
      this.cleanup();

      // Navigate to correct portal based on role
      const targetPath = this.isDoctor ? '/portal/doctor/dashboard' : '/portal/patient/medical-history';
      console.log('Navigating to:', targetPath);

      this.router.navigate([targetPath]).catch(err => {
        console.error('Primary navigation failed, falling back:', err);
        this.router.navigate(['/appointments/my-appointments']);
      });
    }
  }

  private cleanup() {
    this.signalingSubscription?.unsubscribe();
    this.signalingService.disconnect();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.localVideo) this.localVideo.nativeElement.srcObject = null;
    if (this.remoteVideo) this.remoteVideo.nativeElement.srcObject = null;
  }
}

function firstValueFrom<T>(observable: Observable<T>): Promise<T> {
    return firstValueFromRxjs(observable);
}
