package com.blog.config;

import com.blog.dto.ApiError;
import com.blog.dto.ErrorResponse;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldErrorDetail> details =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(
                                e ->
                                        new ApiError.FieldErrorDetail(
                                                e.getField(),
                                                e.getDefaultMessage(),
                                                e.getCode() != null ? e.getCode() : "invalid"))
                        .collect(Collectors.toList());
        ErrorResponse body =
                ErrorResponse.builder()
                        .error(ApiError.validation("请求校验失败", details))
                        .build();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("not_found", ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;
        if ("category_in_use".equals(ex.getCode())) {
            status = HttpStatus.CONFLICT;
        } else if ("invalid_password".equals(ex.getCode()) || "invalid_token".equals(ex.getCode())) {
            status = HttpStatus.UNAUTHORIZED;
        }
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("invalid_argument", ex.getMessage()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResource(NoResourceFoundException ex) {
        String path = ex.getResourcePath() != null ? ex.getResourcePath() : "";
        if ("favicon.ico".equals(path)) {
            return ResponseEntity.notFound().build();
        }
        log.warn("Resource not found: {}", path);
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("internal_error", "服务器内部错误"));
    }
}
