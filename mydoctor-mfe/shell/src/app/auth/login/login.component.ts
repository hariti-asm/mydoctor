import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  private redirectByRole(): void {
    this.authService.waitForProfile().pipe(take(1)).subscribe(profile => {
      if (profile.role === 'DOCTOR') {
        this.router.navigate(['/portal/doctor/dashboard']);
      } else if (profile.role === 'PATIENT') {
        this.router.navigate(['/portal/patient/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (authResponse) => {
        if (authResponse && authResponse.user) {
          const role = authResponse.user.role;
          if (role === 'DOCTOR') {
            this.router.navigate(['/portal/doctor/dashboard']);
          } else if (role === 'PATIENT') {
            this.router.navigate(['/portal/patient/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = 'Invalid email or password';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred during login';
        this.isLoading = false;
      }
    });
  }
}
