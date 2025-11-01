package ma.hariti.asmaa.mydoctor.userservice.repository;

import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.resetToken = NULL, u.resetTokenExpiryDate = NULL WHERE u.resetToken = :refreshToken")
    void deleteByResetToken(String refreshToken);
}
