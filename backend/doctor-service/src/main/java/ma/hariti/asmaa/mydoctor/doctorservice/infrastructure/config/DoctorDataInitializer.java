package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.DoctorJpaEntity;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository.DoctorJpaRepository;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.ReviewEntity;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository.ReviewRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DoctorDataInitializer implements CommandLineRunner {

    private final DoctorJpaRepository doctorRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        // ID 1 Placeholder to align with user-service (where Admin is ID 1)
        seedSingleDoctor("System", "Placeholder", "admin@mydoctor.com", "System", "0000000000", "System placeholder", 0.0, "System", "System", 0.0, 0.0);
        
        seedSingleDoctor("John", "Doe", "doctor@mydoctor.ma", "General Medicine", "+1234567890", "Experienced general practitioner dedicated to patient care.", 100.0, "123 Healthcare Ave", "New York", 40.7128, -74.0060);
        seedSingleDoctor("Sarah", "Smith", "sarah.smith@mydoctor.ma", "Cardiology", "+1234567891", "Expert in cardiovascular health and prevention.", 150.0, "456 Heart Ln", "New York", 40.730610, -73.935242);
        seedSingleDoctor("Michael", "Lee", "michael.lee@mydoctor.ma", "Pediatrics", "+1234567892", "Specialized in child healthcare and development.", 120.0, "789 Kids St", "Los Angeles", 34.0522, -118.2437);
        seedSingleDoctor("Emily", "Chen", "emily.chen@mydoctor.ma", "Neurology", "+1234567893", "Focuses on neurological disorders and brain health.", 180.0, "101 Brain Way", "Chicago", 41.8781, -87.6298);
        seedSingleDoctor("David", "Wilson", "david.wilson@mydoctor.ma", "Orthopedics", "+1234567894", "Expert in bone and joint surgery and rehabilitation.", 200.0, "202 Bone Cir", "Houston", 29.7604, -95.3698);
        seedSingleDoctor("Linda", "Garcia", "linda.garcia@mydoctor.ma", "Dermatology", "+1234567895", "Specialized in skin cancer detection and aesthetic dermatology.", 130.0, "303 Skin Dr", "Miami", 25.7617, -80.1918);

        // Ensure all doctors have reviews
        doctorRepository.findAll().forEach(doctor -> {
            if (reviewRepository.findByDoctorId(doctor.getId()).isEmpty()) {
                seedReviewsForDoctor(doctor.getId());
            }
        });
    }

    private void seedSingleDoctor(String firstName, String lastName, String email, String speciality, String phoneNumber, String bio, Double fee, String address, String city, Double lat, Double lon) {
        if (!doctorRepository.existsByEmail(email)) {
            log.info("Seeding Doctor profile: " + firstName + " " + lastName + " (" + email + ")");
            DoctorJpaEntity doctor = DoctorJpaEntity.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .speciality(speciality)
                    .phoneNumber(phoneNumber)
                    .bio(bio)
                    .consultationFee(fee)
                    .address(address)
                    .city(city)
                    .latitude(lat)
                    .longitude(lon)
                    .build();
            DoctorJpaEntity savedDoctor = doctorRepository.save(doctor);
            seedReviewsForDoctor(savedDoctor.getId());
        }
    }

    private void seedReviewsForDoctor(Long doctorId) {
        log.info("Seeding reviews for doctor ID: " + doctorId);
        List<ReviewEntity> reviews = Arrays.asList(
            ReviewEntity.builder()
                .doctorId(doctorId)
                .author("Alice Johnson")
                .rating(5)
                .date("2 days ago")
                .text("Very professional and caring doctor. Highly recommended!")
                .build(),
            ReviewEntity.builder()
                .doctorId(doctorId)
                .author("Bob Miller")
                .rating(4)
                .date("1 week ago")
                .text("Great consultation, very thorough and explained everything clearly.")
                .build()
        );
        reviewRepository.saveAll(reviews);
    }
}
