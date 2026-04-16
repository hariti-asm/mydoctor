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
    private String status;
    private String appointmentType;
    private String reason;
    private String notes;
    private String meetingLink;

    public boolean isUpcoming() {
        return startDateTime != null && startDateTime.isAfter(LocalDateTime.now());
    }

    public void cancel() {
        this.status = "CANCELLED";
    }

    public void confirm() {
        this.status = "CONFIRMED";
    }

    public void complete() {
        this.status = "COMPLETED";
    }
}
