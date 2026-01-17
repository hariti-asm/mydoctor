package ma.hariti.asmaa.mydoctor.appointmentservice.domain.model;

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
public class Appointment {
    private Long id;
    private Long doctorId;
    private Long patientId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String status; // PENDING, CONFIRMED, CANCELLED
    private String appointmentType; // IN_PERSON, VIDEO
    private String reason;
    private String notes;

    public boolean isUpcoming() {
        return startDateTime != null && startDateTime.isAfter(LocalDateTime.now());
    }

    public void cancel() {
        this.status = "CANCELLED";
    }

    public void confirm() {
        this.status = "CONFIRMED";
    }
}
