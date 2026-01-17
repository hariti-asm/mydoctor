package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionEmailRequest {
    private String to;
    private String patientName;
    private String doctorName;
    private String diagnosis;
    private String prescription;
    private String notes;
}
