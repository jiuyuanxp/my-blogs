package com.blog.repository;

import com.blog.model.Role;
import com.blog.model.RolePermission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findAllByRoleId(Long roleId);

    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.role = :role")
    void deleteByRole(Role role);

    void deleteByRoleId(Long roleId);

    @Query("SELECT COUNT(rp) FROM RolePermission rp WHERE rp.permission.id = :permissionId")
    long countByPermissionId(@Param("permissionId") Long permissionId);
}
