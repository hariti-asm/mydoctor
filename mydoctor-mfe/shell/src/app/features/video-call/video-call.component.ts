import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { SignalingService, WebRTCMessage } from '../../core/services/signaling.service';
import { Subscription, Observable, firstValueFrom as firstValueFromRxjs, filter, take, timeout, catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html'
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideoMain') localVideoMain!: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideoPIP') localVideoPIP!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  appointmentId: string | null = null;
  isDoctor = false;
  userEmail: string | null = null;
  isMuted = false;
  isVideoOff = false;
  isRemoteJoined = false;
  mediaUnavailable = false;
  initStatus = 'Initializing...';
  initError: string | null = null;
  private sessionId = Math.random().toString(36).substring(2);

  get currentUrl(): string {
    return window.location.href;
  }

  private peerConnection?: RTCPeerConnection;
  localStream: MediaStream | null = null;
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
    this.initStatus = 'Loading user profile...';
    // Load user profile
    this.authService.userProfile$.pipe(
      filter(profile => !!profile),
      take(1),
      timeout(10000),
      catchError(err => {
        console.error('Profile load timeout/error:', err);
        this.initError = 'Failed to load user profile. Please ensure you are logged in.';
        return throwError(() => err);
      })
    ).subscribe(profile => {
      this.userEmail = profile!.email;
      this.isDoctor = profile!.role === 'DOCTOR';
      console.log('User profile loaded:', this.userEmail, 'isDoctor:', this.isDoctor);
      this.profileReady = true;
      this.tryInitCall();
    });

    // Global initialization timeout
    setTimeout(() => {
      if (!this.initError && (!this.userEmail || (!this.localStream && !this.mediaUnavailable))) {
        this.initError = 'Initialization taking longer than expected. Please check your connection and permissions.';
      }
    }, 15000);
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

    this.initStatus = 'Accessing camera and microphone...';
    console.log('Initializing call for appointment:', this.appointmentId);
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.updateLocalVideoElements();
      this.initStatus = 'Connecting to signaling server...';

      // --- START RECORDING ---
      this.mediaRecorder = new MediaRecorder(this.localStream);
      this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) this.videoChunks.push(event.data);
      };
      this.mediaRecorder.start();
      // -----------------------

    } catch (e) {
      console.error('Could not access camera/microphone:', e);
      this.mediaUnavailable = true;
      this.initError = 'Could not access camera/microphone. Please ensure you have granted permissions and are on HTTPS.';
      return; // Stop initialization if media access fails
    }

    // Connect to signaling server
    this.signalingService.connect(this.appointmentId);

    // Listen for messages
    this.signalingSubscription = this.signalingService.onMessage().subscribe(msg => {
      this.handleSignalingMessage(msg);
    });

    // Wait for signaling connection to be established with a 10s timeout
    console.log('Waiting for signaling connection for appointment:', this.appointmentId);
    try {
      await firstValueFromRxjs(
        this.signalingService.connected$.pipe(
          filter(connected => connected === true),
          take(1),
          // Add a timeout so we don't hang forever
          timeout(10000),
          catchError(() => {
            console.error('Signaling connection timed out after 10s');
            this.mediaUnavailable = true; // Use this to show an error state
            this.initError = 'Signaling connection timed out. Please check your internet connection.';
            return throwError(() => new Error('Signaling timeout'));
          })
        )
      );
      console.log('Signaling connected, setting up peer connection and joining...');
      this.initStatus = 'Setting up peer connection...';
    } catch (err) {
      console.error('Failed to initialize call due to signaling issues:', err);
      if (!this.initError) { // Don't overwrite a more specific error
        this.initError = 'Failed to connect to the call server. Please try again.';
      }
      return;
    }

    this.setupPeerConnection();

    // Send join message to announce presence
    this.signalingService.sendSignal({
      type: 'join',
      data: { role: this.isDoctor ? 'DOCTOR' : 'PATIENT' },
      sender: this.userEmail!,
      sessionId: this.sessionId,
      appointmentId: this.appointmentId
    });
    this.initStatus = 'Waiting for other participant...';
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
        this.initStatus = 'Call connected!';
        this.updateLocalVideoElements();
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.appointmentId) {
        this.signalingService.sendSignal({
          type: 'candidate',
          data: event.candidate,
          sender: this.userEmail!,
          sessionId: this.sessionId,
          appointmentId: this.appointmentId
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
          this.isRemoteJoined = true;
          this.initStatus = 'Call connected!';
          this.updateLocalVideoElements();
      } else if (this.peerConnection?.connectionState === 'failed' || this.peerConnection?.connectionState === 'disconnected') {
          console.error('Peer connection failed or disconnected.');
          if (!this.isRemoteJoined) { // Only show error if call never properly connected
            this.initError = 'Call connection failed or disconnected. Please check your network.';
          }
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
      sender: this.userEmail!,
      sessionId: this.sessionId,
      appointmentId: this.appointmentId
    });
  }

  private async handleSignalingMessage(msg: any) {
    if (msg.sessionId === this.sessionId) return; // Ignore own messages from this session

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
    } else if (msg.data?.role === 'DOCTOR') {
      // I am the patient, and a doctor just joined.
      // I should announce myself again so the doctor knows to create an offer.
      console.log('Doctor joined, announcing myself...');
      this.signalingService.sendSignal({
        type: 'join',
        data: { role: 'PATIENT' },
        sender: this.userEmail!,
        sessionId: this.sessionId,
        appointmentId: this.appointmentId!
      });
    }
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
      sender: this.userEmail!,
      sessionId: this.sessionId,
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

  toggleAudio() {
    this.isMuted = !this.isMuted;
    this.localStream?.getAudioTracks().forEach(track => track.enabled = !this.isMuted);
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    this.localStream?.getVideoTracks().forEach(track => track.enabled = !this.isVideoOff);
  }

  leaveCall() {
    this.endCall();
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

  private updateLocalVideoElements() {
    if (!this.localStream) return;

    // Use a small timeout to allow Angular to render the newly swapped elements
    setTimeout(() => {
      const main = this.localVideoMain?.nativeElement;
      const pip = this.localVideoPIP?.nativeElement;

      if (main) {
        main.srcObject = this.localStream || null;
        main.play().catch(e => console.warn('Main video autoplay blocked:', e));
      }
      if (pip) {
        pip.srcObject = this.localStream || null;
        pip.play().catch(e => console.warn('PIP video autoplay blocked:', e));
      }
    }, 100);
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

    if (this.localVideoMain) this.localVideoMain.nativeElement.srcObject = null;
    if (this.localVideoPIP) this.localVideoPIP.nativeElement.srcObject = null;
    if (this.remoteVideo) this.remoteVideo.nativeElement.srcObject = null;
  }
}

function firstValueFrom<T>(observable: Observable<T>): Promise<T> {
    return firstValueFromRxjs(observable);
}
