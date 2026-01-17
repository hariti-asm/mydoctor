package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.DoctorJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorJpaRepository extends JpaRepository<DoctorJpaEntity, Long> {
}
