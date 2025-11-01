package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Use AUTO for TABLE_PER_CLASS
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String resetToken;

    private LocalDateTime resetTokenExpiryDate;

    // ✅ Set token and expiration date easily
    public void setResetToken(String token, int minutesToExpire) {
        this.resetToken = token;
        this.resetTokenExpiryDate = LocalDateTime.now().plusMinutes(minutesToExpire);
    }

    public boolean isResetTokenValid(String token) {
        return this.resetToken != null &&
                this.resetToken.equals(token) &&
                this.resetTokenExpiryDate != null &&
                this.resetTokenExpiryDate.isAfter(LocalDateTime.now());
    }

    public void clearResetToken() {
        this.resetToken = null;
        this.resetTokenExpiryDate = null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
