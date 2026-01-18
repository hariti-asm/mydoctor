package ma.hariti.asmaa.mydoctor.userservice.service.serviceDefault;

import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.userservice.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceDefault implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public EmailServiceDefault(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendWelcomeEmail(String to, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Welcome to MyDoctor");
        message.setText("""
                Welcome to  MyDoctor!

                Your account has been created successfully.
                Your temporary password is: %s

                Please change your password after logging in for security purposes.

                Best regards,
                The MyDoctor Team
                """.formatted(password));

        try {
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Password Reset Request - My Doctor");
        message.setText("""
                Hello,

                We received a request to reset your password.
                To reset your password, use the following token: %s

                If you didn't request this, please ignore this email or contact support.
                This token will expire in 30 minutes.

                Best regards,
                The MyDoctor Team
                """.formatted(resetToken));

        try {
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
        }
    }

    @Override
    public void sendPrescriptionEmail(String to, String patientName, String doctorName, String diagnosis,
            String prescription, String notes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("New Prescription From Dr. " + doctorName + " - MyDoctor");
        message.setText("""
                Hello %s,

                You have received a new prescription from Dr. %s.

                --- APPOINTMENT DETAILS ---
                Diagnosis: %s
                Prescription:
                %s

                Additional Notes:
                %s

                --------------------------

                You can also view this prescription in your patient portal.

                Best regards,
                The MyDoctor Team
                """.formatted(patientName, doctorName, diagnosis, prescription, notes));

        try {
            mailSender.send(message);
            log.info("Prescription email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send prescription email to: {}", to, e);
        }
    }

    @Override
    public void sendMeetingLinkEmail(String to, String patientName, String doctorName, String date, String time,
            String meetingLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Video Consultation Meeting Link - MyDoctor");
        message.setText("""
                Hello,

                This is a reminder for your video consultation on MyDoctor.

                --- APPOINTMENT DETAILS ---
                Patient: %s
                Doctor: Dr. %s
                Date: %s
                Time: %s

                MEETING LINK: %s
                ---------------------------

                Please ensure you have a stable internet connection and are in a quiet place before joining the call.

                Best regards,
                The MyDoctor Team
                """.formatted(patientName, doctorName, date, time, meetingLink));

        try {
            mailSender.send(message);
            log.info("Meeting link email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send meeting link email to: {}", to, e);
        }
    }
}