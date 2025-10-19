package ma.hariti.asmaa.mydoctor.userservice.service;

import ma.hariti.asmaa.mydoctor.userservice.dto.UserRegistrationRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserResponse;

import ma.hariti.asmaa.mydoctor.userservice.dto.LoginRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.LoginResponse;

public interface AuthService {
    UserResponse register(UserRegistrationRequest request);
    LoginResponse login(LoginRequest request);
    void logout(String userId);
}
