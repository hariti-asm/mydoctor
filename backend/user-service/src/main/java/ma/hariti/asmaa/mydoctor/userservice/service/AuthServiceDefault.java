package ma.hariti.asmaa.mydoctor.userservice.service;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.userservice.dto.request.*;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.AuthResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.Admin;
import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import ma.hariti.asmaa.mydoctor.userservice.entity.Patient;
import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import ma.hariti.asmaa.mydoctor.userservice.exception.InvalidTokenException;
import ma.hariti.asmaa.mydoctor.userservice.exception.UserNotFoundException;
import ma.hariti.asmaa.mydoctor.userservice.mapper.UserMapper;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import ma.hariti.asmaa.mydoctor.userservice.security.JwtService;
import ma.hariti.asmaa.mydoctor.userservice.security.UserDetailsImpl;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@Transactional
public class AuthServiceDefault implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserMapper userMapper;

    public AuthServiceDefault(AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.userMapper = userMapper;
    }

    @Override
    public AuthResponse login(@Valid LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            String token = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            log.info("User successfully logged in: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(userMapper.toResponse(user))
                    .build();
        } catch (AuthenticationException e) {
            log.error("Login failed for user {}: {}", request.getEmail(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse loginWithRememberMe(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            String token = jwtService.generateToken(userDetails, true);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            String rememberMeToken = refreshToken;

            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            log.info("User successfully logged in with remember-me: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .rememberMeToken(rememberMeToken)
                    .user(userMapper.toResponse(user))
                    .build();
        } catch (AuthenticationException e) {
            log.error("Login with remember-me failed for user {}: {}", request.getEmail(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Login with remember-me failed for user {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Login with remember-me failed: " + e.getMessage());
        }
    }

    @Override
    public void forgotPassword(@Valid ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiryDate(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            log.info("Password reset token sent to user: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    @Transactional
    public void resetPassword(@Valid ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (user.getResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiryDate(null);
        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getEmail());
    }

    public void changePassword(String email, UpdatePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void registerUser(@Valid RegisterUserRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }

            boolean isFirstUser = userRepository.count() == 0;

            if (!isFirstUser) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                    throw new IllegalStateException("No authenticated user found");
                }
            } else {
                request.setRole(Role.ADMIN);
            }

            User user = createUserByRole(request);
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            User savedUser = userRepository.save(user);
            userRepository.flush();

            log.info("Created new user with role {} and email {}", request.getRole(), request.getEmail());

            try {
                emailService.sendWelcomeEmail(savedUser.getEmail(), request.getPassword());
            } catch (Exception e) {
                log.error("Failed to send welcome email to {}: {}", request.getEmail(), e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to register user {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            String userEmail = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (jwtService.isTokenValid(refreshToken, new UserDetailsImpl(user))) {
                String token = jwtService.generateToken(new UserDetailsImpl(user));
                String newRefreshToken = jwtService.generateRefreshToken(new UserDetailsImpl(user));

                return AuthResponse.builder()
                        .token(token)
                        .refreshToken(newRefreshToken)
                        .user(userMapper.toResponse(user))
                        .build();
            }
            throw new InvalidTokenException("Invalid refresh token");
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }

    private void validateRoleCreation(Role currentUserRole, Role targetRole) {
        boolean isAllowed = switch (currentUserRole) {
            // case ADMIN -> targetRole == Role.CANDIDATE;
            // case CANDIDATE -> false;
            default -> false;
        };

        if (!isAllowed) {
            String message = String.format("User with role %s is not authorized to create users with role %s",
                    currentUserRole, targetRole);
            log.warn(message);
            throw new IllegalArgumentException(message);
        }
    }

    private User createUserByRole(RegisterUserRequest request) {
        return switch (request.getRole()) {
            case ADMIN -> Admin.builder()
                    .email(request.getEmail())
                    .name(request.getName())
                    .role(Role.ADMIN)
                    .build();
            case DOCTOR -> Doctor.builder()
                    .email(request.getEmail())
                    .name(request.getName())
                    .role(Role.DOCTOR)
                    .build();
            case PATIENT -> Patient.builder()
                    .email(request.getEmail())
                    .name(request.getName())
                    .role(Role.PATIENT)
                    .build();
            default -> throw new IllegalArgumentException("Invalid role for registration: " + request.getRole());
        };
    }

    @Override
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Basic fields
        UserProfileResponse.UserProfileResponseBuilder responseBuilder = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole());

        // Split name into first and last name
        if (user.getName() != null) {
            String[] common = user.getName().split(" ", 2);
            responseBuilder.firstName(common[0]);
            if (common.length > 1) {
                responseBuilder.lastName(common[1]);
            }
        }

        // Doctor specific fields
        if (user instanceof Doctor doctor) {
            responseBuilder.specialization(doctor.getSpecialization())
                    .education(doctor.getEducation())
                    // Map experiences
                    .experiences(doctor.getExperiences() != null
                            ? doctor.getExperiences().stream()
                                    .map(exp -> ma.hariti.asmaa.mydoctor.userservice.dto.response.ExperienceResponse
                                            .builder()
                                            .id(exp.getId())
                                            .institution(exp.getInstitution())
                                            .position(exp.getPosition())
                                            .startDate(exp.getStartDate())
                                            .endDate(exp.getEndDate())
                                            .description(exp.getDescription())
                                            .build())
                                    .collect(java.util.stream.Collectors.toList())
                            : java.util.Collections.emptyList())
                    // Map diplomas
                    .diplomaPaths(doctor.getDiplomaPaths())
                    .description(doctor.getDescription());
        }

        return responseBuilder.build();
    }

    @Override
    public void logout(String refreshToken) {
        // Implementation depends on how you handle refresh tokens (database vs jwt
        // only)
        // userRepository.deleteByResetToken(refreshToken);
        // For now, doing nothing or just logging
        System.out.println("User logged out successfully. Refresh token invalidated.");
    }

    @Override
    public UserProfileResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Update Name (First + Last)
        String fullName = request.getFirstName();
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            fullName += " " + request.getLastName();
        }
        user.setName(fullName);

        // Update Doctor specific fields
        if (user instanceof Doctor doctor) {
            log.info("Updating doctor profile. Diplomas in request: {}", request.getDiplomaPaths());
            if (request.getSpecialization() != null)
                doctor.setSpecialization(request.getSpecialization());
            if (request.getEducation() != null)
                doctor.setEducation(request.getEducation());
            if (request.getDescription() != null)
                doctor.setDescription(request.getDescription());

            // Update Experiences
            if (request.getExperiences() != null) {
                // Clear existing (simple approach: remove all and re-add)
                if (doctor.getExperiences() != null) {
                    doctor.getExperiences().clear();
                } else {
                    doctor.setExperiences(new java.util.ArrayList<>());
                }

                // Add new
                for (ExperienceRequest expReq : request.getExperiences()) {
                    ma.hariti.asmaa.mydoctor.userservice.entity.Experience experience = ma.hariti.asmaa.mydoctor.userservice.entity.Experience
                            .builder()
                            .institution(expReq.getInstitution())
                            .position(expReq.getPosition())
                            .startDate(expReq.getStartDate())
                            .endDate(expReq.getEndDate())
                            .description(expReq.getDescription())
                            .doctor(doctor)
                            .build();
                    doctor.getExperiences().add(experience);
                }
            }
            // Update Diplomas
            if (request.getDiplomaPaths() != null) {
                // Determine if it's a new list or update existing
                if (doctor.getDiplomaPaths() != null) {
                    doctor.getDiplomaPaths().clear();
                    doctor.getDiplomaPaths().addAll(request.getDiplomaPaths());
                } else {
                    doctor.setDiplomaPaths(new java.util.ArrayList<>(request.getDiplomaPaths()));
                }
            }
        }

        userRepository.save(user);

        // Return updated profile
        return getUserProfile(email);
    }
}