package ma.hariti.asmaa.mydoctor.userservice.mapper;

import ma.hariti.asmaa.mydoctor.userservice.dto.response.UserResponse;
import ma.hariti.asmaa.mydoctor.userservice.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

//    @Mapping(source = "username", target = "firstName")
    UserResponse toResponse(User user);
}
