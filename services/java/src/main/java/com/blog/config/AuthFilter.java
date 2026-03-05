package com.blog.config;

import com.blog.auth.TokenService;
import com.blog.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        String auth = request.getHeader("Authorization");
        String token = auth != null && auth.startsWith("Bearer ") ? auth.substring(7).trim() : null;
        boolean validToken = token != null && tokenService.isValid(token);

        if (isPublic(request, path, method)) {
            if (validToken) {
                request.setAttribute("authenticated", true);
            }
            filterChain.doFilter(request, response);
            return;
        }

        if (!validToken) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ErrorResponse body =
                    ErrorResponse.of("invalid_token", "Token 无效或已过期");
            objectMapper.writeValue(response.getOutputStream(), body);
            return;
        }

        request.setAttribute("authenticated", true);
        filterChain.doFilter(request, response);
    }

    private boolean isPublic(HttpServletRequest request, String path, String method) {
        if (path.startsWith("/api/auth/")) {
            return true;
        }
        if (path.equals("/api/categories") && "GET".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/articles") && "GET".equals(method)) {
            // GET /api/articles?all=true 需认证
            return !"true".equals(request.getParameter("all"));
        }
        if (path.equals("/api/comments")) {
            if ("POST".equals(method)) {
                return true;
            }
            // GET /api/comments?articleId=xxx 公开（文章详情页评论）
            if ("GET".equals(method) && request.getParameter("articleId") != null
                    && request.getParameter("includeDeleted") == null) {
                return true;
            }
        }
        if (path.startsWith("/v3/api-docs") || path.startsWith("/doc.html")
                || path.startsWith("/webjars") || path.startsWith("/swagger-ui")) {
            return true;
        }
        if (path.equals("/actuator/health") || path.startsWith("/actuator/")) {
            return true;
        }
        return false;
    }
}
