import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DoctorSearchService, Doctor, Page } from './doctor-search.service';
import { TranslateModule } from '@ngx-translate/core';

// Leaflet is loaded via script tag in index.html, but we can declare it as global
declare var L: any;

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css']
})
export class DoctorSearchComponent implements AfterViewInit {
  searchForm: FormGroup;
  doctors: Doctor[] = [];
  map: any;
  markers: any[] = [];
  
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
      location: ['']
    });
    // Load initial data
    this.onSearch(); 
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully ready, especially in micro-frontends
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('Map container not found, retrying in 500ms...');
      setTimeout(() => this.initMap(), 500);
      return;
    }

    try {
      // Fix for Leaflet default icons in Angular/Bundled environments
      if (L.Icon.Default) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      }

      // Default center (e.g. London)
      const defaultLat = 51.505;
      const defaultLng = -0.09;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map').setView([defaultLat, defaultLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Force a resize fix as Leaflet sometimes loads with 0 height
      setTimeout(() => {
        this.map.invalidateSize();
        if (this.doctors.length > 0) {
          this.updateMarkers();
        }
      }, 500);
    } catch (e) {
      console.error('Error initializing Leaflet map:', e);
    }
  }

  updateMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const group: [number, number][] = [];
    this.doctors.forEach(doctor => {
      if (doctor.latitude && doctor.longitude) {
        const marker = L.marker([doctor.latitude, doctor.longitude])
          .addTo(this.map)
          .bindPopup(`<b>Dr. ${doctor.firstName} ${doctor.lastName}</b><br>${doctor.speciality}`);
        this.markers.push(marker);
        group.push([doctor.latitude, doctor.longitude]);
      }
    });

    // Zoom and center map to show all doctors if any exist
    if (group.length > 0) {
      this.map.fitBounds(group);
    }
  }

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
        this.updateMarkers();
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

  getOSMLink(doctor: any): string {
    if (doctor.latitude && doctor.longitude) {
      return `https://www.openstreetmap.org/?mlat=${doctor.latitude}&mlon=${doctor.longitude}#map=16/${doctor.latitude}/${doctor.longitude}`;
    }
    const query = encodeURIComponent(`${doctor.address}, ${doctor.city}`);
    return `https://www.openstreetmap.org/search?query=${query}`;
  }

  getDiceBearAvatar(doctor: any): string {
    if (doctor.profilePicture) {
      return doctor.profilePicture;
    }
    const seed = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=059669&textColor=ffffff`;
  }
}