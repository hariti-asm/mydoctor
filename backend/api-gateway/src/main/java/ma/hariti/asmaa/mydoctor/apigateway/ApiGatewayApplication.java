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
        "http://localhost:4200",
        "http://a5bf813caec504c59af25ff1ba914a67-1926758161.eu-west-3.elb.amazonaws.com"
    ));
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
