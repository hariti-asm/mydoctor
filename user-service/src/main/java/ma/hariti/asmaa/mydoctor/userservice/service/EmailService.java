package ma.hariti.asmaa.mydoctor.userservice.service;
public interface EmailService {
    void sendWelcomeEmail(String to, String password);
    void sendPasswordResetEmail(String to, String resetToken);
}
