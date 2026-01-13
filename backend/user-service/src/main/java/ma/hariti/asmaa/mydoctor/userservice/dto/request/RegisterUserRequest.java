package ma.hariti.asmaa.mydoctor.userservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;

@Data
@Builder
public class RegisterUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    private String name;


    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Password is required")
    private String password;


}