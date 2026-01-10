import {BehaviorSubject, catchError, map, Observable, tap, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Auth} from '../models/auth.model';
import UserProfileResponse = Auth.UserProfileResponse;
import LoginRequest = Auth.LoginRequest;
import ApiResponse = Auth.ApiResponse;
import AuthResponse = Auth.AuthResponse;
import RegisterRequest = Auth.RegisterRequest;
import { Injectable } from '@angular/core';
@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/v1/auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkLoginStatus());
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfileResponse | null>(null);
  public userProfile$: Observable<UserProfileResponse | null> = this.userProfileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (this.checkLoginStatus()) {
      this.loadUserProfile();
    }
  }

  private checkLoginStatus(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Login
  login(email: string, password: string, rememberMe = false): Observable<boolean> {
    const loginRequest: LoginRequest = { email, password, rememberMe };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.storeTokens(response.data);
            this.isLoggedInSubject.next(true);
            this.loadUserProfile();
          }
        }),
        map(response => response.success),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  // Register
  register(registerData: RegisterRequest): Observable<boolean> {
    return this.http.post<void>(`${this.apiUrl}/register`, registerData)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  // Get user profile
  getUserProfile(): Observable<UserProfileResponse> {
    const headers = this.getAuthHeaders();

    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`, { headers })
      .pipe(
        tap(profile => this.userProfileSubject.next(profile)),
        catchError(error => {
          console.error('Get profile error:', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
  }

  // Load user profile
  private loadUserProfile(): void {
    this.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfileSubject.next(profile);
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
      }
    });
  }

  // Update user profile
  updateProfile(updateData: Partial<UserProfileResponse>): Observable<UserProfileResponse> {
    const headers = this.getAuthHeaders();

    return this.http.put<UserProfileResponse>(`${this.apiUrl}/profile`, updateData, { headers })
      .pipe(
        tap(profile => this.userProfileSubject.next(profile)),
        catchError(error => {
          console.error('Update profile error:', error);
          return throwError(() => error);
        })
      );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const headers = this.getAuthHeaders();
    const request = { currentPassword, newPassword };

    return this.http.put<void>(`${this.apiUrl}/change-password`, request, { headers })
      .pipe(
        catchError(error => {
          console.error('Change password error:', error);
          return throwError(() => error);
        })
      );
  }

  // Forgot password
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => error);
        })
      );
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, newPassword })
      .pipe(
        catchError(error => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

  // Refresh token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(response => {
          this.storeTokens(response);
        }),
        catchError(error => {
          console.error('Refresh token error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Logout
  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    const headers = this.getAuthHeaders();

    // Call backend logout endpoint
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }, { headers })
        .subscribe({
          error: (error) => console.error('Logout error:', error)
        });
    }

    // Clear local storage
    this.clearTokens();
    this.isLoggedInSubject.next(false);
    this.userProfileSubject.next(null);
    this.router.navigate(['/']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserName(): string | null {
    const profile = this.userProfileSubject.value;
    return profile ? `${profile.firstName} ${profile.lastName}` : null;
  }

  getUserEmail(): string | null {
    const profile = this.userProfileSubject.value;
    return profile?.email || null;
  }

  // Private helper methods
  private storeTokens(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('tokenType', authResponse.tokenType);
    localStorage.setItem('expiresIn', authResponse.expiresIn.toString());
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
