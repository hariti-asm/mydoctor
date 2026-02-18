package ma.hariti.asmaa.mydoctor.userservice.service.serviceDefault;

import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.userservice.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceDefault implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

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
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        message.setText("""
                Hello,

                We received a request to reset your password.
                To reset your password, click the link below:
                %s

                Or use the following token manually if the link doesn't work: %s

                If you didn't request this, please ignore this email or contact support.
                This token will expire in 30 minutes.

                Best regards,
                The MyDoctor Team
                """.formatted(resetLink, resetToken));

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
    public void sendMeetingLinkEmail(String to, String recipientName, String patientName, String doctorName,
            String date, String time,
            String meetingLink) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Your Video Consultation - Dr. " + doctorName);

            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
                            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                            .header { background: linear-gradient(135deg, #0d6efd 0%%, #0056b3 100%%); padding: 40px 20px; text-align: center; color: #ffffff; }
                            .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
                            .content { padding: 40px 35px; }
                            .welcome { font-size: 20px; color: #1a1a1b; margin-bottom: 20px; font-weight: 600; }
                            .card { background: #f8fbff; border-radius: 10px; padding: 25px; margin: 25px 0; border: 1px solid #e1e9f0; }
                            .item { margin-bottom: 15px; font-size: 16px; display: block; }
                            .label { color: #6c757d; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; display: block; margin-bottom: 4px; }
                            .label-dark { color: #6c757d; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; display: block; margin-bottom: 4px; }
                            .value { color: #2c3e50; font-weight: 600; font-size: 17px; }
                            .cta { text-align: center; margin-top: 40px; }
                            .btn { background-color: #0d6efd; color: #ffffff !important; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.3s ease; }
                            .footer { background: #f8f9fa; padding: 25px; text-align: center; color: #adb5bd; font-size: 12px; }
                            .tips { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #7f8c8d; font-size: 13px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>MyDoctor Consultation</h1>
                            </div>
                            <div class="content">
                                <div class="welcome">Hello %s,</div>
                                <p>Your video consultation has been scheduled. Here are the appointment details:</p>

                                <div class="card">
                                    <span class="item"><span class="label">Patient</span><span class="value">%s</span></span>
                                    <span class="item"><span class="label">Doctor</span><span class="value">Dr. %s</span></span>
                                    <span class="item"><span class="label">Date</span><span class="value">%s</span></span>
                                    <span class="item"><span class="label">Time</span><span class="value">%s</span></span>
                                </div>

                                <div class="cta">
                                    <a href="%s" class="btn">Start Video Consultation</a>
                                </div>

                                <div class="tips">
                                    <strong>Important:</strong> Please ensure you have a stable connection and are using a supported browser. We recommend joining 5 minutes early to test your setup.
                                </div>
                            </div>
                            <div class="footer">
                                &copy; 2026 MyDoctor Inc. All rights reserved.<br>
                                Ref: APT-%s
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(recipientName, patientName, doctorName, date, time, meetingLink,
                            java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("Premium HTML meeting link email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send premium email", e);
        }
    }
}