package ma.hariti.asmaa.mydoctor.paymentservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long bookingId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
}
