package com.blog.repository;

import com.blog.model.Permission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    boolean existsByCode(String code);

    List<Permission> findAllByTypeOrderBySortOrderAsc(String type);

    List<Permission> findAllByOrderByTypeAscSortOrderAsc();
}
