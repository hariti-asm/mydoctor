package ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.model.Doctor;
import ma.hariti.asmaa.mydoctor.doctorservice.domain.ports.DoctorRepository;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.entity.DoctorJpaEntity;
import ma.hariti.asmaa.mydoctor.doctorservice.infrastructure.persistence.repository.DoctorJpaRepository;
import org.springframework.data.domain.Page;
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
    public Page<Doctor> findAll(org.springframework.data.domain.Pageable pageable) {
        return jpaRepository.findAll(pageable).map(this::toDomain);
    }

    @Override
    public Page<Doctor> searchDoctors(String speciality, String city, org.springframework.data.domain.Pageable pageable) {
        Page<DoctorJpaEntity> entities;
        if (speciality != null && city != null) {
            entities = jpaRepository.findBySpecialityContainingIgnoreCaseAndCityContainingIgnoreCase(speciality, city, pageable);
        } else if (speciality != null) {
            entities = jpaRepository.findBySpecialityContainingIgnoreCase(speciality, pageable);
        } else if (city != null) {
            entities = jpaRepository.findByCityContainingIgnoreCase(city, pageable);
        } else {
            entities = jpaRepository.findAll(pageable);
        }
        return entities.map(this::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

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
                .address(doctor.getAddress())
                .city(doctor.getCity())
                .latitude(doctor.getLatitude())
                .longitude(doctor.getLongitude())
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
                .address(entity.getAddress())
                .city(entity.getCity())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .build();
    }
}
