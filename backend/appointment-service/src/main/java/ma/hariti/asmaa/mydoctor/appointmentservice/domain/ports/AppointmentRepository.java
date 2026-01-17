package ma.hariti.asmaa.mydoctor.appointmentservice.domain.ports;

import ma.hariti.asmaa.mydoctor.appointmentservice.domain.model.Appointment;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository {
    Appointment save(Appointment appointment);
    Optional<Appointment> findById(Long id);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findAll();
    void deleteById(Long id);
}
