package ma.hariti.asmaa.mydoctor.medicalrecordservice.application.service;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model.MedicalRecord;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.ports.MedicalRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordApplicationService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final S3Client s3Client;
    private final SqsClient sqsClient;

    private final String bucketName = "mydoctor-recordings";
    private final String queueUrl = "https://sqs.eu-west-3.amazonaws.com/123456789012/transcription-queue";

    public void processRecording(String appointmentId, MultipartFile file) {
        String s3Key = "recordings/" + appointmentId + ".webm";
        String recordingUrl = "https://" + bucketName + ".s3.amazonaws.com/" + s3Key;

        try {
            // 1. Upload to S3
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 2. Link recording to Medical Record
            MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                    .orElseGet(() -> MedicalRecord.builder()
                            .appointmentId(appointmentId)
                            .recordDate(java.time.LocalDateTime.now())
                            .build());
            
            record.setRecordingUrl(recordingUrl);
            medicalRecordRepository.save(record);

            // 3. Send SQS Message for transcription
            sqsClient.sendMessage(SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody("{\"appointmentId\":\"" + appointmentId + "\", \"s3Uri\":\"s3://" + bucketName + "/" + s3Key + "\"}")
                    .build());

        } catch (IOException e) {
            throw new RuntimeException("Failed to process recording", e);
        }
    }

    public String uploadAttachment(Long recordId, MultipartFile file) {
        String s3Key = "attachments/" + recordId + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        try {
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            String url = "https://" + bucketName + ".s3.amazonaws.com/" + s3Key;
            
            MedicalRecord record = medicalRecordRepository.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));
            
            if (record.getAttachments() == null) {
                record.setAttachments(new java.util.ArrayList<>());
            }
            record.getAttachments().add(url);
            medicalRecordRepository.save(record);
            
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment", e);
        }
    }

    public MedicalRecord createRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    public java.util.Optional<MedicalRecord> getRecordByAppointmentId(String appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId);
    }

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }
}
