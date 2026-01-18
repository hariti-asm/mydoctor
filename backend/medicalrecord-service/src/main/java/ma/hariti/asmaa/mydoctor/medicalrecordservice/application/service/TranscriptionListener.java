package ma.hariti.asmaa.mydoctor.medicalrecordservice.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model.MedicalRecord;
import ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.ports.MedicalRecordRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;
import software.amazon.awssdk.services.transcribe.TranscribeClient;
import software.amazon.awssdk.services.transcribe.model.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranscriptionListener {

    private final SqsClient sqsClient;
    private final TranscribeClient transcribeClient;
    private final S3Client s3Client;
    private final MedicalRecordRepository medicalRecordRepository;
    
    private final String queueUrl = "https://sqs.eu-west-3.amazonaws.com/123456789012/transcription-queue";
    private final String transcriptBucket = "mydoctor-transcripts";

    @Scheduled(fixedRate = 10000)
    public void listen() {
        ReceiveMessageRequest receiveRequest = ReceiveMessageRequest.builder()
                .queueUrl(queueUrl)
                .maxNumberOfMessages(5)
                .build();

        List<Message> messages = sqsClient.receiveMessage(receiveRequest).messages();

        for (Message message : messages) {
            String body = message.body();
            String appointmentId = extractJsonValue(body, "appointmentId");
            String s3Uri = extractJsonValue(body, "s3Uri");
            String jobName = "Job-" + appointmentId + "-" + System.currentTimeMillis();

            // 1. Start Job
            transcribeClient.startTranscriptionJob(StartTranscriptionJobRequest.builder()
                    .transcriptionJobName(jobName)
                    .languageCode(LanguageCode.FR_FR)
                    .media(Media.builder().mediaFileUri(s3Uri).build())
                    .outputBucketName(transcriptBucket)
                    .build());

            // 2. Link job to Medical Record
            medicalRecordRepository.findByAppointmentId(appointmentId).ifPresent(record -> {
                record.setTranscriptionJobName(jobName);
                medicalRecordRepository.save(record);
            });

            sqsClient.deleteMessage(builder -> builder.queueUrl(queueUrl).receiptHandle(message.receiptHandle()));
        }
    }

    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void checkJobStatus() {
        // Find records with active jobs (simplified for demo)
        List<MedicalRecord> activeJobs = medicalRecordRepository.findAll().stream()
                .filter(r -> r.getTranscriptionJobName() != null && r.getAiNotes() == null)
                .collect(Collectors.toList());

        for (MedicalRecord record : activeJobs) {
            GetTranscriptionJobResponse response = transcribeClient.getTranscriptionJob(GetTranscriptionJobRequest.builder()
                    .transcriptionJobName(record.getTranscriptionJobName())
                    .build());

            TranscriptionJobStatus status = response.transcriptionJob().transcriptionJobStatus();
            
            if (status == TranscriptionJobStatus.COMPLETED) {
                String transcriptKey = record.getTranscriptionJobName() + ".json";
                processTranscript(record, transcriptKey);
            } else if (status == TranscriptionJobStatus.FAILED) {
                log.error("Transcription job failed for appointment: {}", record.getAppointmentId());
                record.setTranscriptionJobName(null); // Reset to allow retry
                medicalRecordRepository.save(record);
            }
        }
    }

    private void processTranscript(MedicalRecord record, String transcriptKey) {
        try {
            ResponseInputStream<?> s3Object = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(transcriptBucket)
                    .key(transcriptKey)
                    .build());

            String json = new BufferedReader(new InputStreamReader(s3Object))
                    .lines().collect(Collectors.joining("\n"));

            // Simplified extraction: "transcript":"..."
            String transcript = extractJsonValue(json, "transcript");
            
            // Simulation of AI Summary
            String aiSummary = "AI SUMMARY:\n" + transcript;
            
            record.setAiNotes(aiSummary);
            medicalRecordRepository.save(record);
            log.info("Transcription completed and saved for appointment: {}", record.getAppointmentId());

        } catch (Exception e) {
            log.error("Failed to read transcript from S3", e);
        }
    }

    private String extractJsonValue(String json, String key) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\"" + key + "\":\"([^\"]+)\"").matcher(json);
        return matcher.find() ? matcher.group(1) : "";
    }
}
