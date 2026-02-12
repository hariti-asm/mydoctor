import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var Stripe: any;

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stripe-container bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
      <h3 class="text-white font-black uppercase text-sm tracking-widest mb-6 flex items-center">
        <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        Secure Payment
      </h3>
      
      <div #cardElement class="p-4 bg-zinc-950 border border-zinc-800 rounded-lg focus-within:border-green-500 transition-colors"></div>
      
      <div *ngIf="error" class="text-red-500 text-xs mt-4 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
        {{ error }}
      </div>
      
      <button (click)="pay()" [disabled]="processing" 
        class="w-full mt-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl uppercase tracking-tighter transition-all disabled:opacity-50 flex justify-center items-center">
        <span *ngIf="!processing">Authorize & Confirm Booking</span>
        <span *ngIf="processing" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      </button>
      
      <p class="text-[10px] text-zinc-500 mt-4 text-center font-medium">
        Processed by <span class="text-zinc-400 font-bold italic">Stripe</span>. Your payment info is never stored on our servers.
      </p>
    </div>
  `
})
export class StripePaymentComponent implements OnInit, AfterViewInit {
  @Input() clientSecret!: string;
  @Output() paymentSuccess = new EventEmitter<string>();
  @Output() paymentError = new EventEmitter<string>();

  @ViewChild('cardElement') cardElementRef!: ElementRef;

  stripe: any;
  card: any;
  error = '';
  processing = false;

  ngOnInit(): void {
    this.stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Test Key
    const elements = this.stripe.elements();
    
    this.card = elements.create('card', {
      style: {
        base: {
          color: '#ffffff',
          fontFamily: '"Outfit", "Inter", sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#52525b'
          }
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444'
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.card.mount(this.cardElementRef.nativeElement);
  }

  async pay() {
    if (this.processing) return;

    this.processing = true;
    this.error = '';

    // Handle Mock Mode
    if (this.clientSecret && this.clientSecret.startsWith('mock_secret_')) {
      console.log('Mock Payment Mode Detected');
      setTimeout(() => {
        this.paymentSuccess.emit('mock_pi_' + Date.now());
        this.processing = false;
      }, 1000);
      return;
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card
        }
      });

      if (error) {
        this.error = error.message;
        this.paymentError.emit(this.error);
        this.processing = false;
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        this.paymentSuccess.emit(paymentIntent.id);
        this.processing = false;
      }
    } catch (err) {
      this.error = 'An unexpected error occurred during payment processing.';
      this.paymentError.emit(this.error);
      this.processing = false;
    }
  }
}
