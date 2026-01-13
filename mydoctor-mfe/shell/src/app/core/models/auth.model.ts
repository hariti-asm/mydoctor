// Option 1: Using a namespace
export namespace Auth {
  export enum Role {
    PATIENT = 'PATIENT',
    DOCTOR = 'DOCTOR',
    ADMIN = 'ADMIN'
  }

  // Request Models
  export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  export interface RegisterRequest {
    email: string;
    name: string;
    role: Role;
    password: string;
  }

  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }

  export interface ForgotPasswordRequest {
    email: string;
  }

  export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
  }

  // Response Models
  export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    role: Role;
  }

  export interface AuthResponse {
    token: string;
    refreshToken: string;
    rememberMeToken?: string;
    user: UserResponse;
  }

  export interface UserProfileResponse {
    id: number;
    email: string;
    firstName: string;
    role: Role;
    lastName?: string;
  }

  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
}
