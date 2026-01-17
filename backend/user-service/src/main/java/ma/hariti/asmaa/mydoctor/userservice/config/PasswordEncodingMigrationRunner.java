package ma.hariti.asmaa.mydoctor.userservice.config;

import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncodingMigrationRunner {

    @Bean
    public CommandLineRunner migratePlaintextPasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Iterable<User> users = userRepository.findAll();
            for (User user : users) {
                String pwd = user.getPassword();
                // BCrypt hashes start with $2a$, $2b$, $2y$ etc.
                if (pwd != null && !(pwd.startsWith("$2a$") || pwd.startsWith("$2b$") || pwd.startsWith("$2y$"))) {
                    String encoded = passwordEncoder.encode(pwd);
                    user.setPassword(encoded);
                    userRepository.save(user);
                    System.out.println("Re-encoded password for user: " + user.getEmail());
                }
            }
        };
    }
}
