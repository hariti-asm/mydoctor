package ma.hariti.asmaa.mydoctor.doctorservice.domain.ports;

import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface DoctorRepository {
    Doctor save(Doctor doctor);
    Optional<Doctor> findById(Long id);
    Page<Doctor> findAll(Pageable pageable);
    Page<Doctor> searchDoctors(String speciality, String city, Pageable pageable);
    void deleteById(Long id);
}
