package ma.hariti.asmaa.mydoctor.appointmentservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements org.springframework.web.servlet.config.annotation.WebMvcConfigurer {

    @org.springframework.beans.factory.annotation.Value("${APP_FRONTEND_URL:http://localhost:4200}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200", frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
