package ma.hariti.asmaa.mydoctor.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalDoctors;
    private long totalPatients;
}
