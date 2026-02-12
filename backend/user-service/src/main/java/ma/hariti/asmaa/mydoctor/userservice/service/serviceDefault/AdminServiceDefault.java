package ma.hariti.asmaa.mydoctor.userservice.service.serviceDefault;

import lombok.RequiredArgsConstructor;
import ma.hariti.asmaa.mydoctor.userservice.dto.AdminStatsResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import ma.hariti.asmaa.mydoctor.userservice.entity.enums.Role;
import ma.hariti.asmaa.mydoctor.userservice.mapper.UserMapper;
import ma.hariti.asmaa.mydoctor.userservice.repository.DoctorRepository;
import ma.hariti.asmaa.mydoctor.userservice.repository.UserRepository;
import ma.hariti.asmaa.mydoctor.userservice.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceDefault implements AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final UserMapper userMapper;

    @Override
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        // Since Doctor extends User, totalUsers includes Doctors.
        // If we want distinct counts:
        long totalPatients = userRepository.countByRole(Role.PATIENT);

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .build();
    }

    @Override
    public Page<UserProfileResponse> getAllUsers(Role role, Pageable pageable) {
        Page<User> users;
        if (role != null) {
            users = userRepository.findAllByRole(role, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(userMapper::toUserProfileResponse);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }
}
