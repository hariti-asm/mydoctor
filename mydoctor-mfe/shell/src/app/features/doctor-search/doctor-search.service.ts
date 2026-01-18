import { Injectable } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  location?: string;
  language?: string;
  rating?: number;
  available?: boolean;
  profilePicture?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorSearchService {

  private apiUrl: string;
  private aiUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.apiUrl = `${this.configService.apiUrl}/api/v1/doctors`;
    this.aiUrl = `${this.configService.apiUrl}/api/v1/ai`;
  }

  recommendDoctor(symptoms: string): Observable<{ specialization: string }> {
    return this.http.post<{ specialization: string }>(`${this.aiUrl}/recommend`, { symptoms });
  }

  searchDoctors(filters: { specialization?: string; location?: string; language?: string }, page: number = 0, size: number = 6): Observable<Page<Doctor>> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
        
    if (filters.specialization) params = params.set('specialization', filters.specialization);
    // Note: Backend currently supports specialization and name/keyword search.
    // Location and language might need backend updates if they are to be filtered server-side.
    if (filters.location) params = params.set('search', filters.location); 
    
    return this.http.get<Page<Doctor>>(this.apiUrl, { params });
  }
}