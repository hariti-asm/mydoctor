package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Entity
@DiscriminatorValue("DOCTOR")
@NoArgsConstructor
@SuperBuilder
public class Doctor extends User {
    // Add doctor-specific fields here if needed
}
