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
    private final org.springframework.web.client.RestTemplate restTemplate;
    private final org.springframework.kafka.core.KafkaTemplate<String, AppointmentNotificationRequest> kafkaTemplate;

    @org.springframework.beans.factory.annotation.Value("${APP_FRONTEND_URL:${app.frontend.url:http://localhost:4200}}")
    private String frontendUrl;

    @org.springframework.beans.factory.annotation.Value("${services.user.url:http://localhost:8081/api/v1}")
    private String userServiceUrl;

    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("PENDING");
        Appointment saved = appointmentRepository.save(appointment);

        if ("VIDEO".equals(saved.getAppointmentType())) {
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    notifyUsers(saved);
                } catch (Exception e) {
                    System.err.println("Failed to send appointment notifications: " + e.getMessage());
                }
            });
        }

        return saved;
    }

    private void notifyUsers(Appointment appointment) {
        UserProfileResponse patient = restTemplate.getForObject(
                userServiceUrl + "/users/" + appointment.getPatientId(),
                UserProfileResponse.class);

        UserProfileResponse doctor = restTemplate.getForObject(
                userServiceUrl + "/users/" + appointment.getDoctorId(),
                UserProfileResponse.class);

        if (patient == null || doctor == null)
            return;

        String date = appointment.getStartDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String time = appointment.getStartDateTime().format(DateTimeFormatter.ofPattern("HH:mm"));

        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String meetingLink = baseUrl + "/portal/video-call/" + appointment.getId();

        String patientFullName = patient.getFirstName() + " "
                + (patient.getLastName() != null ? patient.getLastName() : "");
        String doctorFullName = doctor.getFirstName() + " "
                + (doctor.getLastName() != null ? doctor.getLastName() : "");

        AppointmentNotificationRequest patientNotify = AppointmentNotificationRequest.builder()
                .to(patient.getEmail())
                .recipientName(patientFullName)
                .patientName(patientFullName)
                .doctorName(doctorFullName)
                .appointmentDate(date)
                .appointmentTime(time)
                .meetingLink(meetingLink)
                .build();

        AppointmentNotificationRequest doctorNotify = AppointmentNotificationRequest.builder()
                .to(doctor.getEmail())
                .recipientName("Dr. " + doctorFullName)
                .patientName(patientFullName)
                .doctorName(doctorFullName)
                .appointmentDate(date)
                .appointmentTime(time)
                .meetingLink(meetingLink)
                .build();

        // Send to Kafka instead of REST
        kafkaTemplate.send("appointment-notifications", patientNotify);
        kafkaTemplate.send("appointment-notifications", doctorNotify);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
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
        java.util.List<String> allSlots = java.util.Arrays.asList(
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00");

        List<Appointment> existing = appointmentRepository.findByDoctorId(doctorId);
        java.util.List<String> bookedSlots = existing.stream()
                .filter(a -> a.getStartDateTime() != null && a.getStartDateTime().toString().startsWith(date))
                .map(a -> a.getStartDateTime().toLocalTime().toString().substring(0, 5))
                .toList();

        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .toList();
    }
}
