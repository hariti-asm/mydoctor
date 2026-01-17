package ma.hariti.asmaa.mydoctor.userservice.repository;

import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Page<Doctor> findBySpecializationContainingIgnoreCaseAndNameContainingIgnoreCase(String specialization, String name,
            Pageable pageable);

    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);

    Page<Doctor> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
