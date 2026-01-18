package ma.hariti.asmaa.mydoctor.medicalrecordservice.web.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.application.service.MedicalRecordApplicationService;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model.MedicalRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordApplicationService medicalRecordService;

    @PostMapping
    public ResponseEntity<MedicalRecord> createRecord(@RequestBody MedicalRecord record) {
        return ResponseEntity.ok(medicalRecordService.createRecord(record));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByPatientId(patientId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<MedicalRecord> getRecordByAppointment(@PathVariable String appointmentId) {
        return medicalRecordService.getRecordByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecord>> getAllRecords() {
        return ResponseEntity.ok(medicalRecordService.getAllRecords());
    }

    @PostMapping("/upload-recording/{appointmentId}")
    public ResponseEntity<Void> uploadRecording(@PathVariable String appointmentId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        medicalRecordService.processRecording(appointmentId, file);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{recordId}/attachments")
    public ResponseEntity<String> uploadAttachment(@PathVariable Long recordId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(medicalRecordService.uploadAttachment(recordId, file));
    }
}
