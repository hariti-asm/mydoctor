package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WebRTCMessage {
    private String type; // offer, answer, candidate
    private Object data; // SDP or Candidate
    private String sender;
    private String appointmentId;
}
