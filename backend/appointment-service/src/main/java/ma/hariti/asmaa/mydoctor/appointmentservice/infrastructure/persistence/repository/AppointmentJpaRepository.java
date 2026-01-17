package ma.hariti.asmaa.mydoctor.appointmentservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.appointmentservice.infrastructure.persistence.entity.AppointmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentJpaRepository extends JpaRepository<AppointmentJpaEntity, Long> {
    List<AppointmentJpaEntity> findByDoctorId(Long doctorId);
    List<AppointmentJpaEntity> findByPatientId(Long patientId);
}
