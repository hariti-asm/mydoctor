package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Entity
@DiscriminatorValue("PATIENT")
@NoArgsConstructor
@SuperBuilder
public class Patient extends User {
    // Add patient-specific fields here if needed
}
