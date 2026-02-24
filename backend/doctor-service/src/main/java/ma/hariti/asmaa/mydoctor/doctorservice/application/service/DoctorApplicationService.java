package ma.hariti.asmaa.mydoctor.doctorservice.application.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.ports.DoctorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorApplicationService {

    private final DoctorRepository doctorRepository;

    public Doctor registerDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Page<Doctor> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable);
    }

    public Page<Doctor> searchDoctors(String speciality, String city, Pageable pageable) {
        return doctorRepository.searchDoctors(speciality, city, pageable);
    }

    public Doctor getDoctor(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public List<Doctor> bulkRegisterDoctors(List<Doctor> doctors) {
        return doctors.stream()
                .map(doctorRepository::save)
                .toList();
    }
}
