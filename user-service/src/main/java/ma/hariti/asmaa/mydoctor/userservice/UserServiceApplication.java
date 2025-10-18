package ma.hariti.asmaa.mydoctor.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        System.out.println("hello from user services");
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
