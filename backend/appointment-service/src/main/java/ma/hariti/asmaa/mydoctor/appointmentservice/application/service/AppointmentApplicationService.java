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
@lombok.extern.slf4j.Slf4j
public class AppointmentApplicationService {
    private final ma.hariti.asmaa.mydoctor.appointmentservice.domain.ports.AppointmentRepository appointmentRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${services.user.url:http://user-service:8081}")
    private String userServiceUrl;

    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("PENDING");
        
        // Generate meeting link for VIDEO consultations
        if ("VIDEO".equalsIgnoreCase(appointment.getAppointmentType())) {
            String meetingId = "mydoctor-" + java.util.UUID.randomUUID().toString().substring(0, 8);
            appointment.setMeetingLink("https://meet.jit.si/" + meetingId);
        }

        Appointment saved = appointmentRepository.save(appointment);
        
        // Trigger notification asynchronously (simulated by non-blocking call if possible, but RestTemplate is blocking)
        try {
            sendAppointmentNotification(saved);
        } catch (Exception e) {
            log.error("Failed to send appointment notification for ID {}: {}", saved.getId(), e.getMessage());
        }
        
        return saved;
    }

    private void sendAppointmentNotification(Appointment appointment) {
        try {
            log.info("Starting notification flow for appointment ID: {}. Patient: {}, Doctor: {}", 
                appointment.getId(), appointment.getPatientId(), appointment.getDoctorId());
            
            // Fetch Patient and Doctor profiles
            // Note: userServiceUrl already contains /api/v1 from docker-compose
            String patientUrl = userServiceUrl + "/users/" + appointment.getPatientId();
            String doctorUrl = userServiceUrl + "/users/" + appointment.getDoctorId();
            
            log.info("Fetching patient from: {}", patientUrl);
            UserProfileResponse patient = restTemplate.getForObject(patientUrl, UserProfileResponse.class);
            
            log.info("Fetching doctor from: {}", doctorUrl);
            UserProfileResponse doctor = restTemplate.getForObject(doctorUrl, UserProfileResponse.class);

            if (patient == null || doctor == null) {
                log.warn("Could not fetch profiles for notification. Patient: {}, Doctor: {}", patient, doctor);
                return;
            }

            DateTimeFormatter dateGetter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeGetter = DateTimeFormatter.ofPattern("HH:mm");

            // Notify Patient
            AppointmentNotificationRequest patientReq = AppointmentNotificationRequest.builder()
                    .to(patient.getEmail())
                    .recipientName(patient.getFirstName())
                    .patientName(patient.getFirstName() + " " + patient.getLastName())
                    .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                    .appointmentDate(appointment.getStartDateTime().format(dateGetter))
                    .appointmentTime(appointment.getStartDateTime().format(timeGetter))
                    .meetingLink(appointment.getMeetingLink())
                    .build();

            String notifyUrl = userServiceUrl + "/notifications/appointment";
            log.info("Sending notification to: {}", notifyUrl);
            restTemplate.postForEntity(notifyUrl, patientReq, Void.class);
            log.info("Notification sent successfully to patient: {}", patient.getEmail());

        } catch (Exception e) {
            log.error("Error in notification flow for appointment {}: {}", appointment.getId(), e.getMessage());
            e.printStackTrace();
        }
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
