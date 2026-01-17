package ma.hariti.asmaa.mydoctor.userservice.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import ma.hariti.asmaa.mydoctor.userservice.repository.DoctorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public Page<Doctor> searchDoctors(String specialization, String keyword, Pageable pageable) {
        if (specialization != null && !specialization.isBlank() && keyword != null && !keyword.isBlank()) {
            return doctorRepository.findBySpecializationContainingIgnoreCaseAndNameContainingIgnoreCase(specialization,
                    keyword, pageable);
        } else if (specialization != null && !specialization.isBlank()) {
            return doctorRepository.findBySpecializationContainingIgnoreCase(specialization, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            return doctorRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            return doctorRepository.findAll(pageable);
        }
    }
}
