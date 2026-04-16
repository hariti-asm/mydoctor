package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Doctor extends User {
    private String specialization;
    private String education;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> experiences;

    @ElementCollection
    private List<String> diplomaPaths;

    private String description;

    // Domain Logic example: Ensure full name consistency
    public String getFullName() {
        return "Dr. " + getName(); // User has name
    }

    // Domain Logic: Validate consultation fee
    // Note: consultationFee was in the other doctor-service Doctor model, but not
    // here?
    // Checking previous view of User-Service Doctor.java:
    // It did NOT have consultationFee. Only checked in doctor-service.
    // So I will keep it as it was in User-Service to avoid breaking changes unless
    // I need to add it.
}
