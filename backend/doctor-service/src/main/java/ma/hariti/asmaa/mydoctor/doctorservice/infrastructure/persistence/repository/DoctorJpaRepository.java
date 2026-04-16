package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.DoctorJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorJpaRepository extends JpaRepository<DoctorJpaEntity, Long> {
    Page<DoctorJpaEntity> findBySpecialityContainingIgnoreCaseAndCityContainingIgnoreCase(String speciality, String city, Pageable pageable);
    Page<DoctorJpaEntity> findBySpecialityContainingIgnoreCase(String speciality, Pageable pageable);
    Page<DoctorJpaEntity> findByCityContainingIgnoreCase(String city, Pageable pageable);
    Optional<DoctorJpaEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
