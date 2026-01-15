package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;
    @Size(min = 1, max = 100, message = "Email must be between 1 and 100 characters")
    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Education is required")
    private String education;

    @NotEmpty(message = "At least one experience is required")
    @Valid
    private java.util.List<ExperienceRequest> experiences;

    @NotEmpty(message = "At least one diploma/certification is required")
    private java.util.List<String> diplomaPaths;

    @NotBlank(message = "Description is required")
    private String description;

}
