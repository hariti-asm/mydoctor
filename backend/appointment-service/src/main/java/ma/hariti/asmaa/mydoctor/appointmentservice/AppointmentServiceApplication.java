package ma.hariti.asmaa.mydoctor.appointmentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@org.springframework.scheduling.annotation.EnableAsync
public class AppointmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentServiceApplication.class, args);
    }

}
