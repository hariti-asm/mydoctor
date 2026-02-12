package ma.hariti.asmaa.mydoctor.userservice.consumer;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.dto.request.AppointmentNotificationRequest;
import ma.hariti.asmaa.mydoctor.userservice.service.EmailService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentNotificationConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "appointment-notifications", groupId = "user-service-group")
    public void consume(AppointmentNotificationRequest request) {
        System.out.println("Received appointment notification for: " + request.getTo());
        try {
            emailService.sendMeetingLinkEmail(
                    request.getTo(),
                    request.getRecipientName(),
                    request.getPatientName(),
                    request.getDoctorName(),
                    request.getAppointmentDate(),
                    request.getAppointmentTime(),
                    request.getMeetingLink());
        } catch (Exception e) {
            System.err.println("Failed to send email for notification: " + e.getMessage());
            // In a production app, we might send this to a Dead Letter Topic (DLT)
        }
    }
}
