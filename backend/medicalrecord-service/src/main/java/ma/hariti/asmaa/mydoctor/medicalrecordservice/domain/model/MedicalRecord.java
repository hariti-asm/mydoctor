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
    private Long patientId;
    private Long doctorId;
    private LocalDateTime recordDate;
    private String diagnosis;
    private String prescription;
    private String notes;
}
