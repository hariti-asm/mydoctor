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

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordApplicationService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final S3Client s3Client;
    private final SqsClient sqsClient;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.sqs.queue-name}")
    private String queueName;

    private String queueUrl;

    @PostConstruct
    public void init() {
        ensureBucketExists();
        ensureQueueExists();
    }

    private void ensureQueueExists() {
        try {
            queueUrl = sqsClient.getQueueUrl(GetQueueUrlRequest.builder().queueName(queueName).build()).queueUrl();
        } catch (QueueDoesNotExistException e) {
            queueUrl = sqsClient.createQueue(CreateQueueRequest.builder().queueName(queueName).build()).queueUrl();
        }
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            } else {
                throw e;
            }
        }
    }

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
