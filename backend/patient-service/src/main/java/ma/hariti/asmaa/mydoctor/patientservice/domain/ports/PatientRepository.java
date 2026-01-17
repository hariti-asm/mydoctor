package ma.hariti.asmaa.mydoctor.patientservice.domain.ports;

import ma.hariti.asmaa.mydoctor.patientservice.domain.model.Patient;
import java.util.List;
import java.util.Optional;

public interface PatientRepository {
    Patient save(Patient patient);
    Optional<Patient> findById(Long id);
    Optional<Patient> findByEmail(String email);
    List<Patient> findAll();
    void deleteById(Long id);
}
