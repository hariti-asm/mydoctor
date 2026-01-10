import {Component} from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  standalone: true,
  styleUrl: './contact.component.css'
})
export class ContactComponent {
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
//TODO
    // Here you would typically send the form data to your backend
    this.showSuccessMessage = true;

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
