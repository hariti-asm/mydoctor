package ma.hariti.asmaa.mydoctor.userservice.service;


import ma.hariti.asmaa.mydoctor.userservice.dto.request.*;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.AuthResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse loginWithRememberMe(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    AuthResponse refreshToken(String refreshToken);
    void changePassword(String email, UpdatePasswordRequest request);
    void registerUser(RegisterUserRequest request);
    UserProfileResponse getUserProfile(String email);
    void logout(String refreshToken);
    UserProfileResponse updateUserProfile(String email, UpdateProfileRequest request);
}