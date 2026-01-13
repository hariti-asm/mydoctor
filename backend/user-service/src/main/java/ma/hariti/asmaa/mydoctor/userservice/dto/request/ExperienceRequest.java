package ma.hariti.asmaa.mydoctor.userservice.dto.request;

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
    private String institution;
    private String position;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
