package ma.hariti.asmaa.mydoctor.paymentservice.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.paymentservice.dto.PaymentRequest;
import ma.hariti.asmaa.mydoctor.paymentservice.dto.PaymentResponse;
import ma.hariti.asmaa.mydoctor.paymentservice.entity.Payment;
import ma.hariti.asmaa.mydoctor.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${payment.mock:false}")
    private boolean mockMode;

    private final PaymentRepository paymentRepository;

    @PostConstruct
    public void init() {
        if (!mockMode) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    public PaymentResponse createPaymentIntent(PaymentRequest request) throws Exception {
        // Check if payment already exists for this booking
        return paymentRepository.findByBookingId(request.getBookingId())
                .map(payment -> {
                    if (mockMode) {
                        return PaymentResponse.builder()
                                .clientSecret("mock_secret_" + payment.getStripePaymentIntentId())
                                .paymentIntentId(payment.getStripePaymentIntentId())
                                .paymentId(payment.getId())
                                .build();
                    }
                    try {
                        PaymentIntent intent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
                        return PaymentResponse.builder()
                                .clientSecret(intent.getClientSecret())
                                .paymentIntentId(intent.getId())
                                .paymentId(payment.getId())
                                .build();
                    } catch (Exception e) {
                        throw new RuntimeException("Error retrieving existing payment intent", e);
                    }
                })
                .orElseGet(() -> {
                    try {
                        if (mockMode) {
                            String mockIntentId = "pi_mock_" + System.currentTimeMillis();
                            Payment payment = Payment.builder()
                                    .bookingId(request.getBookingId())
                                    .userId(request.getUserId())
                                    .amount(request.getAmount())
                                    .currency(request.getCurrency())
                                    .status("PENDING")
                                    .stripePaymentIntentId(mockIntentId)
                                    .build();

                            paymentRepository.save(payment);

                            return PaymentResponse.builder()
                                    .clientSecret("mock_secret_" + mockIntentId)
                                    .paymentIntentId(mockIntentId)
                                    .paymentId(payment.getId())
                                    .build();
                        }

                        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(request.getAmount().multiply(new BigDecimal("100")).longValue()) // Amount in cents
                                .setCurrency(request.getCurrency().toLowerCase())
                                .putMetadata("bookingId", request.getBookingId().toString())
                                .putMetadata("userId", request.getUserId().toString())
                                .build();

                        PaymentIntent intent = PaymentIntent.create(params);

                        Payment payment = Payment.builder()
                                .bookingId(request.getBookingId())
                                .userId(request.getUserId())
                                .amount(request.getAmount())
                                .currency(request.getCurrency())
                                .status("PENDING")
                                .stripePaymentIntentId(intent.getId())
                                .build();

                        paymentRepository.save(payment);

                        return PaymentResponse.builder()
                                .clientSecret(intent.getClientSecret())
                                .paymentIntentId(intent.getId())
                                .paymentId(payment.getId())
                                .build();
                    } catch (Exception e) {
                        throw new RuntimeException("Error creating payment intent", e);
                    }
                });
    }

    public void updatePaymentStatus(String paymentIntentId, String status) {
        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus(status);
            paymentRepository.save(payment);
            // TODO: Notify appointment-service about the payment status update (Kafka/Feign)
        });
    }
}
