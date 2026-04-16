package ma.hariti.asmaa.mydoctor.patientservice.infrastructure.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.entity.PatientJpaEntity;
import ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.repository.PatientJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientDataInitializer implements CommandLineRunner {

    private final PatientJpaRepository patientRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!patientRepository.existsByEmail("patient@mydoctor.ma")) {
            log.info("Seeding Patient domain data...");
            PatientJpaEntity patient = PatientJpaEntity.builder()
                    .firstName("Jane")
                    .lastName("Smith")
                    .email("patient@mydoctor.ma")
                    .phoneNumber("+1234567899")
                    .dateOfBirth(LocalDate.of(1990, 5, 15))
                    .gender("Female")
                    .address("456 Maple St")
                    .bloodGroup("A+")
                    .build();
            patientRepository.save(patient);
        }
    }
}
