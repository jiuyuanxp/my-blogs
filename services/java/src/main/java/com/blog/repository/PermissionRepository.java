package com.blog.repository;

import com.blog.model.Permission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    boolean existsByCode(String code);

    Optional<Permission> findByCode(String code);

    List<Permission> findAllByTypeOrderBySortOrderAsc(String type);

    List<Permission> findAllByOrderByTypeAscSortOrderAsc();

    List<Permission> findAllByParentId(Long parentId);

    /** 查找指定类型且 parent_id 为 null 的权限（用于迁移旧数据） */
    List<Permission> findByTypeAndParentIdIsNull(String type);
}
