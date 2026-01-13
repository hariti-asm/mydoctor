package ma.hariti.asmaa.mydoctor.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceResponse {
    private Long id;
    private String institution;
    private String position;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
