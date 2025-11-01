package ma.hariti.asmaa.mydoctor.userservice.dto.response;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponseDTO<T> {
    private final boolean success;
    private final T data;
    private final String error;
    private final int status;

    public static <T> ApiResponseDTO<T> success(T data, int status) {
        return new ApiResponseDTO<>(true, data, null, status);
    }

    public static <T> ApiResponseDTO<T> success(T data) {
        return new ApiResponseDTO<>(true, data, null, 200);
    }

    public static <T> ApiResponseDTO<T> error(String message, int status) {
        return new ApiResponseDTO<>(false, null, message, status);
    }

    public static <T> ApiResponseDTO<T> error(String message, T data, int status) {
        return new ApiResponseDTO<>(false, data, message, status);
    }


}
