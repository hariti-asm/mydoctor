package ma.hariti.asmaa.mydoctor.userservice.config;

import ma.hariti.asmaa.mydoctor.userservice.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:4200}")
        private String frontendUrl;

        public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter,
                        AuthenticationProvider authenticationProvider) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.authenticationProvider = authenticationProvider;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/v1/auth/login",
                                                                "/api/v1/auth/register",
                                                                "/api/v1/auth/forgot-password",
                                                                "/api/v1/auth/reset-password",
                                                                "/api/v1/auth/refresh-token",
                                                                "/api/v1/files/**",
                                                                "/api/v1/users/**",
                                                                "/api/v1/doctors/**",
                                                                "/api/v1/notifications/**",
                                                                "/ws/**",
                                                                "/error")
                                                .permitAll()
                                                .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                
                // Set default allowed origin
                configuration.addAllowedOrigin("http://localhost:4200");
                
                // Add origins from frontendUrl (handles potentially comma-separated string)
                if (frontendUrl != null && !frontendUrl.isEmpty()) {
                        String[] origins = frontendUrl.split(",");
                        for (String origin : origins) {
                                String trimmedOrigin = origin.trim();
                                if (!trimmedOrigin.isEmpty() && !trimmedOrigin.equals("http://localhost:4200")) {
                                        configuration.addAllowedOrigin(trimmedOrigin);
                                        System.out.println("CORS: Added allowed origin: " + trimmedOrigin);
                                }
                        }
                }

                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"));
                configuration.setExposedHeaders(Arrays.asList("Authorization"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

}