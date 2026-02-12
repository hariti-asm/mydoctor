package ma.hariti.asmaa.mydoctor.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private String clientSecret;
    private String paymentIntentId;
    private Long paymentId;
}
