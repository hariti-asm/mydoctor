import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';
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
    isDoctor = false;
    diplomaPaths: string[] = [];
    uploadingFile = false;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private fileService: FileService
    ) {
        this.profileForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
            role: [{ value: '', disabled: true }],
            // Doctor specific fields
            specialization: [''],
            education: [''],
            description: [''],
            experiences: this.formBuilder.array([])
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    get experiences(): FormArray {
        return this.profileForm.get('experiences') as FormArray;
    }

    createExperienceGroup(exp?: Auth.Experience): FormGroup {
        return this.formBuilder.group({
            institution: [exp?.institution || '', Validators.required],
            position: [exp?.position || '', Validators.required],
            startDate: [exp?.startDate || ''],
            endDate: [exp?.endDate || ''],
            description: [exp?.description || '']
        });
    }

    addExperience(): void {
        this.experiences.push(this.createExperienceGroup());
    }

    removeExperience(index: number): void {
        this.experiences.removeAt(index);
    }

    loadProfile(): void {
        this.isLoading = true;
        this.authService.getUserProfile().subscribe({
            next: (profile: UserProfileResponse) => {
                this.isDoctor = profile.role === Auth.Role.DOCTOR;

                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    role: profile.role,
                    specialization: profile.specialization,
                    education: profile.education,
                    description: profile.description
                });

                // Load experiences
                this.experiences.clear();
                if (profile.experiences) {
                    profile.experiences.forEach(exp => {
                        this.experiences.push(this.createExperienceGroup(exp));
                    });
                }

                // Load diploma paths
                this.diplomaPaths = profile.diplomaPaths || [];

                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load profile';
                this.isLoading = false;
                console.error(error);
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.uploadingFile = true;

            this.fileService.uploadFile(file).subscribe({
                next: (response) => {
                    this.diplomaPaths.push(response.url);
                    this.uploadingFile = false;
                },
                error: (error) => {
                    console.error('File upload failed:', error);
                    this.errorMessage = 'Failed to upload file';
                    this.uploadingFile = false;
                }
            });
        }
    }

    removeDiploma(index: number): void {
        this.diplomaPaths.splice(index, 1);
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
            lastName: formValues.lastName,
            specialization: formValues.specialization,
            education: formValues.education,
            description: formValues.description,
            experiences: formValues.experiences,
            diplomaPaths: this.diplomaPaths
        };

        this.authService.updateProfile(updateData).subscribe({
            next: (updatedProfile) => {
                this.successMessage = 'Profile updated successfully';
                this.isLoading = false;
                // Update diplomaPaths from response
                this.diplomaPaths = updatedProfile.diplomaPaths || [];
            },
            error: (error) => {
                this.errorMessage = 'Failed to update profile';
                this.isLoading = false;
                console.error(error);
            }
        });
    }
}
