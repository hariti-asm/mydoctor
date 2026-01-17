package ma.hariti.asmaa.mydoctor.doctorservice.application.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.ports.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorApplicationService {

    private final DoctorRepository doctorRepository;

    public Doctor registerDoctor(Doctor doctor) {
        // Application layer logic (orchestration)
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctor(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }
}
