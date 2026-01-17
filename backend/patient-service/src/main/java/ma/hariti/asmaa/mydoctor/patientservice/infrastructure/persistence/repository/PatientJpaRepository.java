package ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.patientservice.infrastructure.persistence.entity.PatientJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientJpaRepository extends JpaRepository<PatientJpaEntity, Long> {
    Optional<PatientJpaEntity> findByEmail(String email);
}
