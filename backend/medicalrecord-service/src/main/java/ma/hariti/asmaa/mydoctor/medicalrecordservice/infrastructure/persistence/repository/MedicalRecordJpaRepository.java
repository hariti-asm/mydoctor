package ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.repository;

import ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.entity.MedicalRecordJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalRecordJpaRepository extends JpaRepository<MedicalRecordJpaEntity, Long> {
    List<MedicalRecordJpaEntity> findByPatientId(Long patientId);
    java.util.Optional<MedicalRecordJpaEntity> findByAppointmentId(String appointmentId);
    java.util.Optional<MedicalRecordJpaEntity> findByTranscriptionJobName(String transcriptionJobName);
}
