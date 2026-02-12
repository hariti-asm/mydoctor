package ma.hariti.asmaa.mydoctor.userservice.service;

import ma.hariti.asmaa.mydoctor.userservice.dto.AdminStatsResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    AdminStatsResponse getStats();

    Page<UserProfileResponse> getAllUsers(Role role, Pageable pageable);

    void deleteUser(Long id);
}
