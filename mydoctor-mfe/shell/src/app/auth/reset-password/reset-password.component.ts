import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set new password
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <div *ngIf="successMessage" class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ successMessage }}</span>
            <p class="mt-2 text-sm">
              <a routerLink="/login" class="font-bold underline">Click here to login</a>
            </p>
          </div>

          <div *ngIf="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{{ errorMessage }}</span>
          </div>

          <form *ngIf="!successMessage" [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="token" class="block text-sm font-medium text-gray-700">
                Reset Token
              </label>
              <div class="mt-1">
                <input id="token" formControlName="token" type="text" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Paste the token from your email"
                  [ngClass]="{'border-red-500': resetPasswordForm.get('token')?.invalid && resetPasswordForm.get('token')?.touched}">
              </div>
              <div *ngIf="resetPasswordForm.get('token')?.invalid && resetPasswordForm.get('token')?.touched" class="text-red-500 text-xs mt-1">
                Reset token is required.
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div class="mt-1 relative">
                <input id="password" formControlName="password" [type]="showPassword ? 'text' : 'password'" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  [ngClass]="{'border-red-500': resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched}">
                  <button type="button" (click)="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500">
                    {{ showPassword ? 'Hide' : 'Show' }}
                  </button>
              </div>
              <div *ngIf="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched" class="text-red-500 text-xs mt-1">
                Password must be at least 6 characters.
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div class="mt-1">
                <input id="confirmPassword" formControlName="confirmPassword" [type]="showPassword ? 'text' : 'password'" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  [ngClass]="{'border-red-500': resetPasswordForm.errors?.['mismatch'] && resetPasswordForm.get('confirmPassword')?.touched}">
              </div>
              <div *ngIf="resetPasswordForm.errors?.['mismatch'] && resetPasswordForm.get('confirmPassword')?.touched" class="text-red-500 text-xs mt-1">
                Passwords do not match.
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="resetPasswordForm.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="isLoading" class="mr-2">
                  <!-- Spinner -->
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2001/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordForm: FormGroup;
    isLoading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.resetPasswordForm = this.fb.group({
            token: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Get token from query params
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            if (token) {
                this.resetPasswordForm.patchValue({ token: token });
            }
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    onSubmit(): void {
        if (this.resetPasswordForm.invalid) return;

        this.isLoading = true;
        this.successMessage = null;
        this.errorMessage = null;

        const { token, password } = this.resetPasswordForm.value;

        this.authService.resetPassword(token, password).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Password has been successfully reset. You can now login with your new password.';
                this.resetPasswordForm.reset();
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to reset password. The link may have expired.';
            }
        });
    }
}
