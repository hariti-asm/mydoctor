package ma.hariti.asmaa.mydoctor.doctorservice.domain.ports;

import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository {
    Doctor save(Doctor doctor);
    Optional<Doctor> findById(Long id);
    List<Doctor> findAll();
    void deleteById(Long id);
}
