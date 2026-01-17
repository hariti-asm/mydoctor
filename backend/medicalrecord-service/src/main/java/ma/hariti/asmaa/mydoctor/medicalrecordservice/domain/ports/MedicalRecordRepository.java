package ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.ports;

import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model.MedicalRecord;
import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository {
    MedicalRecord save(MedicalRecord record);
    Optional<MedicalRecord> findById(Long id);
    List<MedicalRecord> findByPatientId(Long patientId);
    List<MedicalRecord> findAll();
    void deleteById(Long id);
}
