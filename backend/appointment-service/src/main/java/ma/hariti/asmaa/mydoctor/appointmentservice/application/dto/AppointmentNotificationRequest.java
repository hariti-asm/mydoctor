package ma.hariti.asmaa.mydoctor.appointmentservice.application.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentNotificationRequest {
    private String to;
    private String patientName;
    private String doctorName;
    private String appointmentDate;
    private String appointmentTime;
    private String meetingLink;
}
