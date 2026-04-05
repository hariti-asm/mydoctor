package ma.hariti.asmaa.mydoctor.appointmentservice.application.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.appointmentservice.application.dto.AppointmentNotificationRequest;
import ma.hariti.asmaa.mydoctor.appointmentservice.application.dto.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.appointmentservice.domain.model.Appointment;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentApplicationService {
    private final ma.hariti.asmaa.mydoctor.appointmentservice.domain.ports.AppointmentRepository appointmentRepository;

    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("PENDING");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public Appointment confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.confirm();
        return appointmentRepository.save(appointment);
    }

    public Appointment completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.complete();
        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.cancel();
        appointmentRepository.save(appointment);
    }

    public List<String> getAvailableSlots(Long doctorId, String date) {
        // Simple mock logic: Return slots from 09:00 to 17:00 excluding booked ones
        java.util.List<String> allSlots = java.util.Arrays.asList("09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
                "15:00", "16:00", "17:00");

        List<Appointment> existing = appointmentRepository.findByDoctorId(doctorId);
        java.util.List<String> bookedSlots = existing.stream()
                .filter(a -> a.getStartDateTime() != null && a.getStartDateTime().toString().startsWith(date))
                .map(a -> a.getStartDateTime().toLocalTime().toString().substring(0, 5)).toList();

        return allSlots.stream().filter(slot -> !bookedSlots.contains(slot)).toList();
    }
}
