import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Auth } from '../../core/models/auth.model';
import Role = Auth.Role;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;

  registrationTitle = 'Join MyDoctor';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.PATIENT] // Default to Patient
    });

    this.route.queryParams.subscribe(params => {
      const roleParam = params['role'];
      if (roleParam === 'DOCTOR') {
        this.registerForm.patchValue({ role: Role.DOCTOR });
        this.registrationTitle = 'Join as a Doctor';
      } else if (roleParam === 'PATIENT') {
        this.registerForm.patchValue({ role: Role.PATIENT });
        this.registrationTitle = 'Create Patient Account';
      } else {
        this.registrationTitle = 'Join MyDoctor';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValues = this.registerForm.value;
    const registerRequest = {
      name: `${formValues.firstName} ${formValues.lastName}`,
      email: formValues.email,
      password: formValues.password,
      role: formValues.role
    };

    this.authService.register(registerRequest).subscribe({
      next: (success) => {
        if (success) {
          // Navigate to login or auto-login
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'An error occurred during registration';
        this.isLoading = false;
      }
    });
  }
}
