package ma.hariti.asmaa.mydoctor.paymentservice.repository;

import ma.hariti.asmaa.mydoctor.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    Optional<Payment> findByBookingId(Long bookingId);
}
