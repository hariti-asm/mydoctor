import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Auth } from '../models/auth.model';
import UserProfileResponse = Auth.UserProfileResponse;

export interface AdminStatsResponse {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.apiUrl}/api/v1/admin`;
  }

  getStats(): Observable<any> { // ApiResponseDTO<AdminStatsResponse>
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getUsers(role?: string, page: number = 0, size: number = 10): Observable<any> { // Page<UserProfileResponse>
    let url = `${this.apiUrl}/users?page=${page}&size=${size}`;
    if (role) {
      url += `&role=${role}`;
    }
    return this.http.get<any>(url);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
