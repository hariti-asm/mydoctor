package ma.hariti.asmaa.mydoctor.doctorservice.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String speciality;
    private String phoneNumber;
    private String bio;
    private Double consultationFee;

    // Domain Logic example: Ensure full name consistency
    public String getFullName() {
        return "Dr. " + firstName + " " + lastName;
    }

    // Domain Logic: Validate consultation fee
    public void updateConsultationFee(Double newFee) {
        if (newFee != null && newFee >= 0) {
            this.consultationFee = newFee;
        } else {
            throw new IllegalArgumentException("Consultation fee must be non-negative");
        }
    }
}
