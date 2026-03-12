package com.blog.service;

import com.blog.dto.PermissionDto;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Permission;
import com.blog.repository.PermissionRepository;
import com.blog.repository.RolePermissionRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public List<PermissionDto> list(String type) {
        List<Permission> permissions = type != null && !type.isBlank()
                ? permissionRepository.findAllByTypeOrderBySortOrderAsc(type)
                : permissionRepository.findAllByOrderByTypeAscSortOrderAsc();

        if (type != null && !type.isBlank()) {
            return permissions.stream().map(PermissionDto::from).toList();
        }

        return buildTree(permissions, null);
    }

    private List<PermissionDto> buildTree(List<Permission> permissions, Long parentId) {
        List<PermissionDto> result = new ArrayList<>();
        for (Permission p : permissions) {
            if ((parentId == null && p.getParentId() == null) || (parentId != null && parentId.equals(p.getParentId()))) {
                PermissionDto dto = PermissionDto.from(p);
                dto.setChildren(buildTree(permissions, p.getId()));
                result.add(dto);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public PermissionDto getById(Long id) {
        Permission p = permissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("权限不存在"));
        return PermissionDto.from(p);
    }

    @Transactional
    public PermissionDto create(String code, String name, String type, Long parentId, Integer sortOrder) {
        if (permissionRepository.existsByCode(code)) {
            throw new BusinessException("code_exists", "权限编码已存在");
        }

        Permission p = new Permission();
        p.setCode(code);
        p.setName(name);
        p.setType(type != null ? type : "menu");
        p.setParentId(parentId);
        p.setSortOrder(sortOrder != null ? sortOrder : 0);
        p = permissionRepository.save(p);
        return PermissionDto.from(p);
    }

    @Transactional
    public PermissionDto update(Long id, String name, String type, Long parentId, Integer sortOrder) {
        Permission p = permissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("权限不存在"));

        if (name != null) {
            p.setName(name);
        }
        if (type != null) {
            p.setType(type);
        }
        if (parentId != null) {
            p.setParentId(parentId);
        }
        if (sortOrder != null) {
            p.setSortOrder(sortOrder);
        }
        p = permissionRepository.save(p);
        return PermissionDto.from(p);
    }

    @Transactional
    public void delete(Long id) {
        Permission p = permissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("权限不存在"));
        long refCount = rolePermissionRepository.countByPermissionId(id);
        if (refCount > 0) {
            throw new BusinessException("permission_in_use", "该权限已被角色使用，无法删除");
        }
        permissionRepository.delete(p);
    }
}
