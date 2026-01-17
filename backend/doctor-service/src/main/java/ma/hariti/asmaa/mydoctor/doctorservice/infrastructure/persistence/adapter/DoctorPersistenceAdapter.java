package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.ports.DoctorRepository;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.DoctorJpaEntity;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository.DoctorJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DoctorPersistenceAdapter implements DoctorRepository {

    private final DoctorJpaRepository jpaRepository;

    @Override
    public Doctor save(Doctor doctor) {
        DoctorJpaEntity entity = toEntity(doctor);
        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public Optional<Doctor> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Doctor> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    // Mapper methods (Manually for now, could use MapStruct later)
    private DoctorJpaEntity toEntity(Doctor doctor) {
        return DoctorJpaEntity.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .email(doctor.getEmail())
                .speciality(doctor.getSpeciality())
                .phoneNumber(doctor.getPhoneNumber())
                .bio(doctor.getBio())
                .consultationFee(doctor.getConsultationFee())
                .build();
    }

    private Doctor toDomain(DoctorJpaEntity entity) {
        return Doctor.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .speciality(entity.getSpeciality())
                .phoneNumber(entity.getPhoneNumber())
                .bio(entity.getBio())
                .consultationFee(entity.getConsultationFee())
                .build();
    }
}
