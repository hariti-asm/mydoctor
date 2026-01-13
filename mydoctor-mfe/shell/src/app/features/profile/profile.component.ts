import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Auth } from '../../core/models/auth.model';
import UserProfileResponse = Auth.UserProfileResponse;

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    isLoading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService
    ) {
        this.profileForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            role: [{ value: '', disabled: true }]
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.authService.getUserProfile().subscribe({
            next: (profile: UserProfileResponse) => {
                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    role: profile.role
                });
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load profile';
                this.isLoading = false;
                console.error(error);
            }
        });
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.successMessage = null;
        this.errorMessage = null;

        const formValues = this.profileForm.getRawValue();
        const updateData: Partial<UserProfileResponse> = {
            firstName: formValues.firstName,
            lastName: formValues.lastName
        };

        this.authService.updateProfile(updateData).subscribe({
            next: (updatedProfile) => {
                this.successMessage = 'Profile updated successfully';
                this.isLoading = false;
                // Update local form with latest data
                this.profileForm.patchValue({
                    firstName: updatedProfile.firstName,
                    lastName: updatedProfile.lastName
                });
            },
            error: (error) => {
                this.errorMessage = 'Failed to update profile';
                this.isLoading = false;
                console.error(error);
            }
        });
    }
}
