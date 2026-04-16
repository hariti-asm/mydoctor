package ma.hariti.asmaa.mydoctor.userservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.userservice.entity.Admin;
import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import ma.hariti.asmaa.mydoctor.userservice.entity.Patient;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import org.springframework.context.annotation.DependsOn;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@DependsOn("databasePreFlightFixer")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedDoctor();
        seedPatient();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@mydoctor.com")) {
            log.info("Seeding Admin user...");
            Admin admin = Admin.builder()
                    .name("System Admin")
                    .email("admin@mydoctor.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }

    private void seedDoctor() {
        seedSingleDoctor("John Doe", "doctor@mydoctor.ma", "General Medicine", "MD from University of Medicine", "Experienced general practitioner.");
        seedSingleDoctor("Sarah Smith", "sarah.smith@mydoctor.ma", "Cardiology", "MD from Harvard Medical School", "Expert in cardiovascular health and prevention.");
        seedSingleDoctor("Michael Lee", "michael.lee@mydoctor.ma", "Pediatrics", "MD from Stanford University", "Specialized in child healthcare and development.");
        seedSingleDoctor("Emily Chen", "emily.chen@mydoctor.ma", "Neurology", "MD from Johns Hopkins University", "Focuses on neurological disorders and brain health.");
        seedSingleDoctor("David Wilson", "david.wilson@mydoctor.ma", "Orthopedics", "MD from Yale School of Medicine", "Expert in bone and joint surgery and rehabilitation.");
        seedSingleDoctor("Linda Garcia", "linda.garcia@mydoctor.ma", "Dermatology", "MD from University of Miami", "Specialized in skin cancer detection and aesthetic dermatology.");
        
        // Adding more doctors
        seedSingleDoctor("Thomas Anderson", "thomas.anderson@mydoctor.ma", "Psychiatry", "MD from Columbia University", "Specialist in mental health and cognitive therapy.");
        seedSingleDoctor("Maria Rodriguez", "maria.rodriguez@mydoctor.ma", "Ophthalmology", "MD from University of Pennsylvania", "Expert in vision care and eye surgery.");
        seedSingleDoctor("James Miller", "james.miller@mydoctor.ma", "Oncology", "MD from Duke University", "Specialized in cancer treatment and research.");
        seedSingleDoctor("Jennifer Davis", "jennifer.davis@mydoctor.ma", "Gynecology", "MD from Washington University", "Expert in women's health and reproductive medicine.");
        seedSingleDoctor("Robert Garcia", "robert.garcia@mydoctor.ma", "Urology", "MD from University of Chicago", "Specialized in urinary tract and male reproductive health.");
        seedSingleDoctor("Mary Martinez", "mary.martinez@mydoctor.ma", "Endocrinology", "MD from Emory University", "Expert in hormone-related disorders and diabetes.");
        seedSingleDoctor("William Hernandez", "william.hernandez@mydoctor.ma", "Rheumatology", "MD from University of Washington", "Specialized in autoimmune and musculoskeletal diseases.");
        seedSingleDoctor("Linda Lopez", "linda.lopez@mydoctor.ma", "Gastroenterology", "MD from Vanderbilt University", "Expert in digestive system disorders.");
        seedSingleDoctor("Richard Gonzalez", "richard.gonzalez@mydoctor.ma", "Pulmonology", "MD from University of California", "Specialized in respiratory and lung health.");
        seedSingleDoctor("Barbara Wilson", "barbara.wilson@mydoctor.ma", "Infectious Diseases", "MD from Boston University", "Expert in viral and bacterial disease treatment.");
        seedSingleDoctor("Joseph Anderson", "joseph.anderson@mydoctor.ma", "Radiology", "MD from Northwestern University", "Specialist in medical imaging and diagnostics.");
        seedSingleDoctor("Susan Thomas", "susan.thomas@mydoctor.ma", "Internal Medicine", "MD from Case Western Reserve University", "Comprehensive care for adult health conditions.");
        seedSingleDoctor("Thomas Moore", "thomas.moore@mydoctor.ma", "Anesthesiology", "MD from University of Virginia", "Expert in pain management and surgical anesthesia.");
        seedSingleDoctor("Jessica Jackson", "jessica.jackson@mydoctor.ma", "Emergency Medicine", "MD from Ohio State University", "Specialized in urgent and critical medical care.");
        seedSingleDoctor("Mark White", "mark.white@mydoctor.ma", "Pathology", "MD from University of Michigan", "Expert in disease diagnosis through laboratory analysis.");
        seedSingleDoctor("Karen Harris", "karen.harris@mydoctor.ma", "Nephrology", "MD from Indiana University", "Specialized in kidney health and renal disorders.");
        seedSingleDoctor("Charles Martin", "charles.martin@mydoctor.ma", "Hematology", "MD from University of Florida", "Expert in blood-related disorders and treatments.");
        seedSingleDoctor("Sandra Thompson", "sandra.thompson@mydoctor.ma", "Plastic Surgery", "MD from Mount Sinai", "Specialized in reconstructive and aesthetic surgery.");
        seedSingleDoctor("Steven Wood", "steven.wood@mydoctor.ma", "ENT Specialist", "MD from Georgetown University", "Expert in ear, nose, and throat disorders.");
    }

    private void seedSingleDoctor(String name, String email, String specialization, String education, String description) {
        if (!userRepository.existsByEmail(email)) {
            log.info("Seeding Doctor user: " + name + " (" + email + ")");
            Doctor doctor = Doctor.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.DOCTOR)
                    .specialization(specialization)
                    .education(education)
                    .description(description)
                    .build();
            userRepository.save(doctor);
        }
    }

    private void seedPatient() {
        if (!userRepository.existsByEmail("patient@mydoctor.ma")) {
            log.info("Seeding Patient user...");
            Patient patient = Patient.builder()
                    .name("Jane Smith")
                    .email("patient@mydoctor.ma")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.PATIENT)
                    .build();
            userRepository.save(patient);
        }
    }
}
