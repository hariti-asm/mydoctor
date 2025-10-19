package ma.hariti.asmaa.mydoctor.userservice.controller;

import ma.hariti.asmaa.mydoctor.userservice.dto.LoginRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.LoginResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserRegistrationRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserResponse;
import ma.hariti.asmaa.mydoctor.userservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRegistrationRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout(null);
        return ResponseEntity.ok().build();
    }
}
