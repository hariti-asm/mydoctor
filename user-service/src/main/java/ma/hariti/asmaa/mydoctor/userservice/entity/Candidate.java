package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Entity
@SuperBuilder
@NoArgsConstructor
public class Candidate extends User {

    public Candidate(
            Long id,
            String name,
            String email,
            String password,
            Role role,
            String resetToken,
            java.time.LocalDateTime resetTokenExpiryDate
    ) {
        super(id, name, email, password, role, resetToken, resetTokenExpiryDate);
    }
}
