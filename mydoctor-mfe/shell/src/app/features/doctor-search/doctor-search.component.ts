import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DoctorSearchService, Doctor, Page } from './doctor-search.service';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css']
})
export class DoctorSearchComponent {
  searchForm: FormGroup;
  doctors: Doctor[] = [];
  
  // Pagination state
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;
  totalElements = 0;

  // AI Modal State
  showAiModal = false;
  aiSymptoms = '';
  aiResponse: string | null = null;
  loadingAi = false;

  constructor(private fb: FormBuilder, private doctorService: DoctorSearchService) {
    this.searchForm = this.fb.group({
      specialization: [''],
      location: [''],
      language: ['']
    });
    // Load initial data
    this.onSearch(); 
  }

  // ... existing search methods ...

  openAiModal() {
    this.showAiModal = true;
    this.aiSymptoms = '';
    this.aiResponse = null;
  }

  closeAiModal() {
    this.showAiModal = false;
  }

  submitSymptoms() {
    if (!this.aiSymptoms.trim()) return;
    
    this.loadingAi = true;
    this.doctorService.recommendDoctor(this.aiSymptoms).subscribe({
      next: (res) => {
        this.aiResponse = res.specialization;
        this.loadingAi = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingAi = false;
      }
    });
  }

  useRecommendation() {
    if (this.aiResponse) {
      this.searchForm.patchValue({ specialization: this.aiResponse });
      this.onSearch();
      this.closeAiModal();
    }
  }

  onSearch() {
    this.currentPage = 0; // Reset to first page on new search
    this.loadDoctors();
  }

  loadDoctors() {
    const filters = this.searchForm.value;
    this.doctorService.searchDoctors(filters, this.currentPage, this.pageSize).subscribe({
      next: (page: Page<Doctor>) => {
        this.doctors = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
      },
      error: (err) => console.error(err)
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadDoctors();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadDoctors();
    }
  }
}