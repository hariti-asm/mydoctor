package ma.hariti.asmaa.mydoctor.userservice.entity;

import jakarta.persistence.*; // Imports everything including OneToMany, ElementCollection, etc.
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Entity
@DiscriminatorValue("DOCTOR")
@NoArgsConstructor
@SuperBuilder
public class Doctor extends User {
    private String specialization;
    private String education;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Experience> experiences;
    
    @ElementCollection
    private java.util.List<String> diplomaPaths;
    
    private String description;
}
