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
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.sqs.model.CreateQueueRequest;
import software.amazon.awssdk.services.sqs.model.GetQueueUrlRequest;
import software.amazon.awssdk.services.sqs.model.QueueDoesNotExistException;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import java.time.Duration;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.application.dto.AppointmentResponse;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordApplicationService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final S3Client s3Client;
    private final SqsClient sqsClient;
    private final RestTemplate restTemplate;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.transcript-bucket}")
    private String transcriptBucket;

    @Value("${aws.sqs.queue-name}")
    private String queueName;

    private String queueUrl;
    @Value("${services.appointment.url:http://localhost:8082/api/v1/appointments}")
    private String appointmentServiceUrl;

    @PostConstruct
    public void init() {
        ensureBucketExists(bucketName);
        ensureBucketExists(transcriptBucket);
        ensureQueueExists();
    }

    private void ensureQueueExists() {
        try {
            queueUrl = sqsClient.getQueueUrl(GetQueueUrlRequest.builder().queueName(queueName).build()).queueUrl();
        } catch (QueueDoesNotExistException e) {
            queueUrl = sqsClient.createQueue(CreateQueueRequest.builder().queueName(queueName).build()).queueUrl();
        }
    }

    private void ensureBucketExists(String bucket) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            } else {
                throw e;
            }
        }
    }

    public void processRecording(String appointmentId, MultipartFile file) {
        String s3Key = "recordings/" + appointmentId + ".webm";

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
            
            // Fetch appointment details to get patientId
            try {
                AppointmentResponse appt = restTemplate.getForObject(appointmentServiceUrl + "/" + appointmentId, AppointmentResponse.class);
                if (appt != null) {
                    record.setPatientId(appt.getPatientId());
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch appointment details for linkage: " + e.getMessage());
            }

            record.setRecordingUrl(s3Key); // Store S3 key instead of full URL
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
        List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
        records.forEach(this::populatePresignedUrls);
        return records;
    }

    public java.util.Optional<MedicalRecord> getRecordByAppointmentId(String appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(record -> {
                    populatePresignedUrls(record);
                    return record;
                });
    }

    public List<MedicalRecord> getAllRecords() {
        List<MedicalRecord> records = medicalRecordRepository.findAll();
        records.forEach(this::populatePresignedUrls);
        return records;
    }

    private void populatePresignedUrls(MedicalRecord record) {
        if (record.getRecordingUrl() != null && !record.getRecordingUrl().startsWith("http")) {
            record.setRecordingUrl(generatePresignedUrl(record.getRecordingUrl()));
        }
    }

    private String generatePresignedUrl(String s3Key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
}
