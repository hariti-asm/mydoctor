package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {
    List<ReviewEntity> findByDoctorId(Long doctorId);
}
