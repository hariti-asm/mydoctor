package ma.hariti.asmaa.mydoctor.doctorservice.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    private Long id;
    private Long doctorId;
    private String author;
    private Integer rating;
    private String date; // E.g. "Just now", "2024-03-21"
    private String text;
}
