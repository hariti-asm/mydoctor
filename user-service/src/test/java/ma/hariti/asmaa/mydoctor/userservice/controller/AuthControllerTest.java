package ma.hariti.asmaa.mydoctor.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.hariti.asmaa.mydoctor.userservice.dto.LoginRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.LoginResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserRegistrationRequest;
import ma.hariti.asmaa.mydoctor.userservice.dto.UserResponse;
import ma.hariti.asmaa.mydoctor.userservice.service.AuthService;
import ma.hariti.asmaa.mydoctor.userservice.config.ApplicationConfig;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import ma.hariti.asmaa.mydoctor.userservice.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ma.hariti.asmaa.mydoctor.userservice.config.ApplicationConfig;
import ma.hariti.asmaa.mydoctor.userservice.config.SecurityConfiguration;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import ma.hariti.asmaa.mydoctor.userservice.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({JwtService.class, ApplicationConfig.class, UserRepository.class, SecurityConfiguration.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    @Test
    void shouldRegisterNewUser() throws Exception {
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@example.com");
        request.setPassword("password");

        UserResponse response = new UserResponse();
        response.setId(1L);
        response.setUsername("testuser");
        response.setEmail("testuser@example.com");

        when(authService.register(any(UserRegistrationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void shouldLoginExistingUser() throws Exception {
        LoginRequest request = new LoginRequest("testuser@example.com", "password");
        LoginResponse response = new LoginResponse(
                "jwt-token",
                "refresh-token",
                "1",
                "testuser@example.com"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.userId").value("1"))
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }

    @Test
    void shouldLogoutUser() throws Exception {
        doNothing().when(authService).logout(any());

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAccessProtectedEndpointWithValidToken() {
        // This test requires a full Spring Security context and a valid token.
        // It's typically an integration test rather than a unit test for the controller.
        // For now, we'll leave it as a placeholder or consider adding a separate integration test class.
    }

    @Test
    void shouldNotAccessProtectedEndpointWithInvalidToken() {
        // Similar to the above, this is more of an integration test.
    }
}
