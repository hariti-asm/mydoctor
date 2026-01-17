package ma.hariti.asmaa.mydoctor.userservice.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.dto.request.PrescriptionEmailRequest;
import ma.hariti.asmaa.mydoctor.userservice.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/prescription")
    public ResponseEntity<Void> sendPrescription(@RequestBody PrescriptionEmailRequest request) {
        emailService.sendPrescriptionEmail(
                request.getTo(),
                request.getPatientName(),
                request.getDoctorName(),
                request.getDiagnosis(),
                request.getPrescription(),
                request.getNotes());
        return ResponseEntity.ok().build();
    }
}
