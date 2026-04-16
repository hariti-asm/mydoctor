package ma.hariti.asmaa.mydoctor.medicalrecordservice.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    private Long id;
    private String appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime recordDate;
    private String diagnosis;
    private String prescription;
    private String notes;
    private String recordingUrl;
    private String aiNotes;
    private String transcript;
    private String summary;
    private java.util.List<String> attachments;
    private String transcriptionJobName;
}
