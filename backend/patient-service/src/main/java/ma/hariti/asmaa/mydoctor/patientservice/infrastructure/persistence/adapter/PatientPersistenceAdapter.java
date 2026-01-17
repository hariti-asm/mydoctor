package ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.patientservice.domain.model.Patient;
import ma.hariti.asmaa.mydoctor.patientservice.domain.ports.PatientRepository;
import ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.entity.PatientJpaEntity;
import ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.repository.PatientJpaRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PatientPersistenceAdapter implements PatientRepository {
    private final PatientJpaRepository jpaRepository;

    @Override
    public Patient save(Patient patient) {
        return toDomain(jpaRepository.save(toEntity(patient)));
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Patient> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public List<Patient> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private PatientJpaEntity toEntity(Patient patient) {
        return PatientJpaEntity.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .phoneNumber(patient.getPhoneNumber())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }

    private Patient toDomain(PatientJpaEntity entity) {
        return Patient.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .dateOfBirth(entity.getDateOfBirth())
                .gender(entity.getGender())
                .address(entity.getAddress())
                .bloodGroup(entity.getBloodGroup())
                .build();
    }
}
