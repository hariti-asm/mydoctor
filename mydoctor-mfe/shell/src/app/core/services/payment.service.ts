import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface PaymentRequest {
  bookingId: number;
  userId: number;
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  paymentId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.apiUrl}/api/v1/payments`;
  }

  createPaymentIntent(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-intent`, request);
  }
}
