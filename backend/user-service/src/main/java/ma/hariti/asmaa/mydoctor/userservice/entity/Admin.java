package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Entity
@NoArgsConstructor
@lombok.experimental.SuperBuilder
public class Admin extends User {
    public Admin(Long id, String name, String email, String password, Role role, String resetToken,
            java.time.LocalDateTime resetTokenExpiryDate) {
        super(id, name, email, password, role, resetToken, resetTokenExpiryDate, null);
    }
}
