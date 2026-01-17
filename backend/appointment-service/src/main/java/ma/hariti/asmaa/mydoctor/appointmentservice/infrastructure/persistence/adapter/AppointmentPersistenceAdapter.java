package ma.hariti.asmaa.mydoctor.appointmentservice.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.appointmentservice.domain.model.Appointment;
import ma.hariti.asmaa.mydoctor.appointmentservice.domain.ports.AppointmentRepository;
import ma.hariti.asmaa.mydoctor.appointmentservice.infrastructure.persistence.entity.AppointmentJpaEntity;
import ma.hariti.asmaa.mydoctor.appointmentservice.infrastructure.persistence.repository.AppointmentJpaRepository;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AppointmentPersistenceAdapter implements AppointmentRepository {
    private final AppointmentJpaRepository jpaRepository;

    @Override
    public Appointment save(Appointment appointment) {
        return toDomain(jpaRepository.save(toEntity(appointment)));
    }

    @Override
    public Optional<Appointment> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Appointment> findByDoctorId(Long doctorId) {
        return jpaRepository.findByDoctorId(doctorId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findByPatientId(Long patientId) {
        return jpaRepository.findByPatientId(patientId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private AppointmentJpaEntity toEntity(Appointment appointment) {
        return AppointmentJpaEntity.builder()
                .id(appointment.getId())
                .doctorId(appointment.getDoctorId())
                .patientId(appointment.getPatientId())
                .startDateTime(appointment.getStartDateTime())
                .endDateTime(appointment.getEndDateTime())
                .status(appointment.getStatus())
                .appointmentType(appointment.getAppointmentType())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .build();
    }

    private Appointment toDomain(AppointmentJpaEntity entity) {
        return Appointment.builder()
                .id(entity.getId())
                .doctorId(entity.getDoctorId())
                .patientId(entity.getPatientId())
                .startDateTime(entity.getStartDateTime())
                .endDateTime(entity.getEndDateTime())
                .status(entity.getStatus())
                .appointmentType(entity.getAppointmentType())
                .reason(entity.getReason())
                .notes(entity.getNotes())
                .build();
    }
}
