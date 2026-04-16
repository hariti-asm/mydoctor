package ma.hariti.asmaa.mydoctor.medicalrecordservice.infrastructure.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @jakarta.persistence.Column(length = 5000)
    private String transcript;
    @jakarta.persistence.Column(length = 2000)
    private String summary;
    
    @jakarta.persistence.ElementCollection
    private java.util.List<String> attachments;
    private String transcriptionJobName;
}
