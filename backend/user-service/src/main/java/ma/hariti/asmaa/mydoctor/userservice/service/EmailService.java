package ma.hariti.asmaa.mydoctor.userservice.service;

public interface EmailService {
    void sendWelcomeEmail(String to, String password);

    void sendPasswordResetEmail(String to, String resetToken);

    void sendPrescriptionEmail(String to, String patientName, String doctorName, String diagnosis, String prescription,
            String notes);
}
