import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfigService } from './config.service';

export interface WebRTCMessage {
    type: string;
    data: any;
    sender: string;
    appointmentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private client!: Client;
  private messageSubject = new Subject<WebRTCMessage>();
  private connectedSource = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSource.asObservable();

  constructor(private configService: ConfigService) {}

  connect(appointmentId: string) {
    const socket = new SockJS(`${this.configService.apiUrl}/ws`);
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to signaling server');
      this.connectedSource.next(true);
      this.client.subscribe(`/topic/appointment/${appointmentId}`, (message: Message) => {
        const body = JSON.parse(message.body) as WebRTCMessage;
        this.messageSubject.next(body);
      });
    };

    this.client.onDisconnect = () => {
      console.log('Disconnected from signaling server');
      this.connectedSource.next(false);
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      this.connectedSource.next(false);
    };

    this.client.activate();
  }

  onMessage(): Observable<WebRTCMessage> {
    return this.messageSubject.asObservable();
  }

  sendSignal(message: WebRTCMessage) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/signal',
        body: JSON.stringify(message)
      });
    } else {
      console.error('STOMP client is not connected');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
