import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-doctors.component.html'
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = [];
  loading = true;
  currentPage = 0;
  totalDoctors = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.adminService.getUsers('DOCTOR', this.currentPage).subscribe({
      next: (response) => {
        this.doctors = response.content;
        this.totalDoctors = response.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load doctors', err);
        this.loading = false;
      }
    });
  }

  verifyDoctor(doctor: any): void {
      // Mock verification logic
      alert(`Doctor ${doctor.firstName} verified.`);
  }

  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to remove this doctor?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.loadDoctors();
        },
        error: (err) => console.error('Failed to delete doctor', err)
      });
    }
  }
}
