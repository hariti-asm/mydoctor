package ma.hariti.asmaa.mydoctor.userservice.mapper;

import ma.hariti.asmaa.mydoctor.userservice.dto.response.ExperienceResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserProfileResponse;
import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.Doctor;
import ma.hariti.asmaa.mydoctor.userservice.entity.Experience;
import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "status", expression = "java(user.isEnabled())")
    UserResponse toResponse(User user);

    default UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }

        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole());

        // Split name into first and last name
        String name = user.getName();
        String firstName = "";
        String lastName = "";
        if (name != null) {
            String[] parts = name.split(" ", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }
        builder.firstName(firstName).lastName(lastName);

        if (user instanceof Doctor) {
            Doctor doctor = (Doctor) user;
            builder.specialization(doctor.getSpecialization())
                    .education(doctor.getEducation())
                    .description(doctor.getDescription())
                    .diplomaPaths(doctor.getDiplomaPaths())
                    .experiences(toExperienceResponseList(doctor.getExperiences()));
        }

        return builder.build();
    }

    default List<ExperienceResponse> toExperienceResponseList(List<Experience> experiences) {
        if (experiences == null) {
            return Collections.emptyList();
        }
        return experiences.stream()
                .map(this::toExperienceResponse)
                .collect(Collectors.toList());
    }

    ExperienceResponse toExperienceResponse(Experience experience);
}
