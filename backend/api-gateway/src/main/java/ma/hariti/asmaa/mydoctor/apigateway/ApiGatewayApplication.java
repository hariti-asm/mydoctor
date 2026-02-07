package ma.hariti.asmaa.mydoctor.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

  public static void main(String[] args) {
    SpringApplication.run(ApiGatewayApplication.class, args);
  }

  @org.springframework.context.annotation.Bean
  public org.springframework.web.cors.reactive.CorsWebFilter corsWebFilter() {
    org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();
    corsConfig.setAllowedOrigins(java.util.Arrays.asList(
        "http://localhost:4200"
    ));
    
    String frontendUrl = System.getenv("APP_FRONTEND_URL");
    if (frontendUrl != null && !frontendUrl.isEmpty()) {
        corsConfig.addAllowedOrigin(frontendUrl);
        System.out.println("Added allowed origin from env: " + frontendUrl);
    } else {
        System.out.println("APP_FRONTEND_URL not set, adding default wildcard/placeholder");
        // Fallback or leave as is? Let's add wildcard pattern for safety if env missing in dev
        // corsConfig.addAllowedOriginPattern("*"); 
    }
    corsConfig.setMaxAge(3600L);
    corsConfig.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    corsConfig.setAllowedHeaders(java.util.Arrays.asList("*"));
    corsConfig.setAllowCredentials(true);
    corsConfig.addExposedHeader("Authorization");

    org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", corsConfig);

    return new org.springframework.web.cors.reactive.CorsWebFilter(source);
  }
}
