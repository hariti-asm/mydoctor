import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgIf, CommonModule} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cta',
  imports: [
    FormsModule,
    NgIf,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './cta.component.html',
  standalone: true,
  styleUrl: './cta.component.css'
})
export class CtaComponent {
  isPopupOpen = false;
  showSuccessMessage = false;

  formData = {
    name: '',
    email: '',
    message: ''
  };

  openPopup(): void {
    this.isPopupOpen = true;
    this.showSuccessMessage = false;
  }
  closePopup(): void {
    this.isPopupOpen = false;
    this.showSuccessMessage = false;
    this.resetForm();
  }

  onSubmit(): void {
    console.log('Form submitted:', this.formData);

    // Here you would typically send the form data to your backend
    // For now, we'll just show a success message
    this.showSuccessMessage = true;

    // Close popup after 2 seconds
    setTimeout(() => {
      this.closePopup();
    }, 2000);
  }

  resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      message: ''
    };
  }
}
