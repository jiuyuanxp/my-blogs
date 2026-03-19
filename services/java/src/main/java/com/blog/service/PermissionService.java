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
    public PermissionDto create(String code, String name, String type, Long parentId,
            String routePath, String component, Boolean isHidden, Integer sortOrder) {
        if (permissionRepository.existsByCode(code)) {
            throw new BusinessException("code_exists", "权限编码已存在");
        }
        if (parentId != null && parentId != 0) {
            Permission parent = permissionRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("父权限不存在"));
            if ("button".equals(parent.getType())) {
                throw new BusinessException("invalid_parent", "按钮不能作为父级，请选择菜单");
            }
        }

        Permission p = new Permission();
        p.setCode(code);
        p.setName(name);
        p.setType(type != null ? type : "menu");
        p.setParentId(parentId != null && parentId == 0 ? null : parentId);
        p.setRoutePath(routePath);
        p.setComponent(component);
        p.setIsHidden(isHidden != null ? isHidden : false);
        p.setSortOrder(sortOrder != null ? sortOrder : 0);
        p = permissionRepository.save(p);
        return PermissionDto.from(p);
    }

    @Transactional
    public PermissionDto update(Long id, String name, String type, Long parentId,
            String routePath, String component, Boolean isHidden, Integer sortOrder) {
        Permission p = permissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("权限不存在"));
        if (parentId != null && parentId.equals(id)) {
            throw new BusinessException("invalid_parent", "不能将自身设为父级");
        }
        if (parentId != null && parentId != 0) {
            Permission parent = permissionRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("父权限不存在"));
            if ("button".equals(parent.getType())) {
                throw new BusinessException("invalid_parent", "按钮不能作为父级");
            }
        }

        if (name != null) {
            p.setName(name);
        }
        if (type != null) {
            p.setType(type);
        }
        if (parentId != null) {
            p.setParentId(parentId == 0 ? null : parentId);
        }
        if (routePath != null) {
            p.setRoutePath(routePath);
        }
        if (component != null) {
            p.setComponent(component);
        }
        if (isHidden != null) {
            p.setIsHidden(isHidden);
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
        List<Long> idsToDelete = collectIdsWithChildren(id);
        for (Long pid : idsToDelete) {
            long refCount = rolePermissionRepository.countByPermissionId(pid);
            if (refCount > 0) {
                throw new BusinessException("permission_in_use", "该权限或其子权限已被角色使用，无法删除");
            }
        }
        for (Long pid : idsToDelete) {
            permissionRepository.findById(pid).ifPresent(permissionRepository::delete);
        }
    }

    private List<Long> collectIdsWithChildren(Long parentId) {
        List<Long> result = new ArrayList<>();
        result.add(parentId);
        List<Permission> children = permissionRepository.findAllByParentId(parentId);
        for (Permission c : children) {
            result.addAll(collectIdsWithChildren(c.getId()));
        }
        return result;
    }
}
