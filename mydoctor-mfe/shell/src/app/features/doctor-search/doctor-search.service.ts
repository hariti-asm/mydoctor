import { Injectable } from '@angular/core';
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

  // Updated to point to user-service port 8081
  private apiUrl = 'http://localhost:9000/api/v1/doctors';

  constructor(private http: HttpClient) { }

  recommendDoctor(symptoms: string): Observable<{ specialization: string }> {
    return this.http.post<{ specialization: string }>('http://localhost:9000/api/v1/ai/recommend', { symptoms });
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