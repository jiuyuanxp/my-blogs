package com.blog.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private ApiError error;

    public static ErrorResponse of(String code, String message) {
        return ErrorResponse.builder()
                .error(ApiError.of(code, message))
                .build();
    }
}
