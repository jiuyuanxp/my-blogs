package com.blog.service;

import com.blog.dto.RoleDto;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Permission;
import com.blog.model.Role;
import com.blog.model.RolePermission;
import com.blog.repository.PermissionRepository;
import com.blog.repository.RolePermissionRepository;
import com.blog.repository.RoleRepository;
import com.blog.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private static final String SUPER_ADMIN = "super_admin";

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleDto> list() {
        return roleRepository.findAll().stream().map(RoleDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDto getById(Long id) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
        RoleDto dto = RoleDto.from(role);
        List<Long> permissionIds = rolePermissionRepository.findAllByRoleId(id).stream()
                .map(rp -> rp.getPermission().getId())
                .collect(Collectors.toList());
        dto.setPermissionIds(permissionIds);
        return dto;
    }

    @Transactional
    public RoleDto create(String code, String name, String description) {
        if (SUPER_ADMIN.equals(code)) {
            throw new BusinessException("forbidden", "不能创建超级管理员角色");
        }
        if (roleRepository.existsByCode(code)) {
            throw new BusinessException("code_exists", "角色编码已存在");
        }

        Role role = new Role();
        role.setCode(code);
        role.setName(name);
        role.setDescription(description);
        role = roleRepository.save(role);
        return RoleDto.from(role);
    }

    @Transactional
    public RoleDto update(Long id, String name, String description) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
        if (SUPER_ADMIN.equals(role.getCode())) {
            throw new BusinessException("forbidden", "不能修改超级管理员角色");
        }

        if (name != null) {
            role.setName(name);
        }
        if (description != null) {
            role.setDescription(description);
        }
        role = roleRepository.save(role);
        return RoleDto.from(role);
    }

    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
        if (SUPER_ADMIN.equals(role.getCode())) {
            throw new BusinessException("forbidden", "不能修改超级管理员权限");
        }

        rolePermissionRepository.deleteByRoleId(roleId);

        if (permissionIds != null && !permissionIds.isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(permissionIds);
            for (Permission p : permissions) {
                RolePermission rp = new RolePermission();
                rp.setRole(role);
                rp.setPermission(p);
                rolePermissionRepository.save(rp);
            }
        }
    }

    @Transactional
    public void delete(Long id) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
        if (SUPER_ADMIN.equals(role.getCode())) {
            throw new BusinessException("forbidden", "不能删除超级管理员角色");
        }
        long userCount = userRepository.countByRoleId(id);
        if (userCount > 0) {
            throw new BusinessException("role_in_use", "该角色下还有用户，无法删除");
        }
        rolePermissionRepository.deleteByRoleId(id);
        roleRepository.delete(role);
    }
}
