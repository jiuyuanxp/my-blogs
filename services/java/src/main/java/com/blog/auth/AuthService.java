package com.blog.auth;

import com.blog.dto.PermissionDto;
import com.blog.exception.BusinessException;
import com.blog.model.Permission;
import com.blog.model.Role;
import com.blog.model.User;
import com.blog.repository.PermissionRepository;
import com.blog.repository.RolePermissionRepository;
import com.blog.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String SUPER_ADMIN_ROLE = "super_admin";

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public String login(String username, String password, boolean rememberMe) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("invalid_credentials", "用户名或密码错误"));

        if ("disabled".equals(user.getStatus())) {
            throw new BusinessException("user_disabled", "账号已禁用");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BusinessException("invalid_credentials", "用户名或密码错误");
        }

        String token = tokenService.createToken(user.getId(), rememberMe);
        return token;
    }

    @Transactional(readOnly = true)
    public MeResponse getCurrentUser(String token) {
        Long userId = tokenService.getUserId(token);
        if (userId == null) {
            throw new BusinessException("invalid_token", "Token 无效或已过期");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("user_not_found", "用户不存在"));

        Role role = user.getRole();
        List<String> permissions;

        if (SUPER_ADMIN_ROLE.equals(role.getCode())) {
            permissions = permissionRepository.findAll().stream()
                    .map(Permission::getCode)
                    .collect(Collectors.toList());
        } else {
            permissions = rolePermissionRepository.findAllByRoleId(role.getId()).stream()
                    .map(rp -> rp.getPermission().getCode())
                    .collect(Collectors.toList());
        }

        return new MeResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname() != null ? user.getNickname() : user.getUsername(),
                role.getCode(),
                permissions
        );
    }

    @Transactional(readOnly = true)
    public List<PermissionDto> getCurrentUserMenus(String token) {
        Long userId = tokenService.getUserId(token);
        if (userId == null) {
            throw new BusinessException("invalid_token", "Token 无效或已过期");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("user_not_found", "用户不存在"));
        Role role = user.getRole();

        List<Permission> allMenus;
        if (SUPER_ADMIN_ROLE.equals(role.getCode())) {
            allMenus = permissionRepository.findAllByTypeOrderBySortOrderAsc("menu");
        } else {
            List<Long> permIds = rolePermissionRepository.findAllByRoleId(role.getId()).stream()
                    .map(rp -> rp.getPermission().getId())
                    .collect(Collectors.toList());
            allMenus = permissionRepository.findAllById(permIds).stream()
                    .filter(p -> "menu".equals(p.getType()))
                    .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                    .collect(Collectors.toList());
        }
        return buildMenuTree(allMenus, null);
    }

    private List<PermissionDto> buildMenuTree(List<Permission> permissions, Long parentId) {
        List<PermissionDto> result = new ArrayList<>();
        for (Permission p : permissions) {
            Long pid = p.getParentId();
            boolean match = (parentId == null && pid == null) || (parentId != null && parentId.equals(pid));
            if (match && !Boolean.TRUE.equals(p.getIsHidden())) {
                PermissionDto dto = PermissionDto.from(p);
                dto.setChildren(buildMenuTree(permissions, p.getId()));
                result.add(dto);
            }
        }
        return result;
    }

    public record MeResponse(Long id, String username, String nickname, String role, List<String> permissions) {}
}
