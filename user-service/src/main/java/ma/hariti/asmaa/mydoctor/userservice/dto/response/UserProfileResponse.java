package ma.hariti.asmaa.mydoctor.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private Role role;
}