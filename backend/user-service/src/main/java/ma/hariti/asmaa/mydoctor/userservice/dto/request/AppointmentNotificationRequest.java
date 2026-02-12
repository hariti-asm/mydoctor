package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentNotificationRequest {
    private String to;
    private String recipientName;
    private String patientName;
    private String doctorName;
    private String appointmentDate;
    private String appointmentTime;
    private String meetingLink;
}
