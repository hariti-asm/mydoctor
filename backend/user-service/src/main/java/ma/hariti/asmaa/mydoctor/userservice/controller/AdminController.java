package ma.hariti.asmaa.mydoctor.userservice.controller;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.dto.AdminStatsResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.ApiResponseDTO;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import ma.hariti.asmaa.mydoctor.userservice.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponseDTO<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponseDTO.success(adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserProfileResponse>> getAllUsers(
            @RequestParam(required = false) Role role,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(role, pageable));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
