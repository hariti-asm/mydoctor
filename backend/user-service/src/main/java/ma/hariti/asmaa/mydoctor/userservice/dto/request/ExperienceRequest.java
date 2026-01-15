package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceRequest {
    @NotBlank(message = "Institution is required")
    private String institution;

    @NotBlank(message = "Position is required")
    private String position;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotBlank(message = "Description is required")
    private String description;
}
