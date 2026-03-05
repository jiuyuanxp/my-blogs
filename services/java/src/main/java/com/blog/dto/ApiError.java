package com.blog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private String code;
    private String message;
    private List<FieldErrorDetail> details;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldErrorDetail {
        private String field;
        private String message;
        private String code;
    }

    public static ApiError of(String code, String message) {
        return ApiError.builder().code(code).message(message).build();
    }

    public static ApiError validation(String message, List<FieldErrorDetail> details) {
        return ApiError.builder()
                .code("validation_error")
                .message(message)
                .details(details)
                .build();
    }
}
