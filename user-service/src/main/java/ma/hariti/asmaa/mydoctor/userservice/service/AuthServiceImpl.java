package ma.hariti.asmaa.mydoctor.userservice.service;

import ma.hariti.asmaa.mydoctor.userservice.dto.LoginRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.LoginResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserRegistrationRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserResponse register(UserRegistrationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());

        return response;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateToken(authentication);
        String refreshToken = jwtService.generateRefreshToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found")); // This should not happen after authentication

        return new LoginResponse(
                jwt,
                refreshToken,
                user.getId().toString(),
                user.getEmail()
        );
    }

    @Override
    public void logout(String userId) {
        // Invalidate token or clear session if applicable
        // For JWT, client-side removal is often sufficient, but server-side blacklisting can be implemented.
        // For now, we'll just clear the security context.
        SecurityContextHolder.clearContext();
    }
}
