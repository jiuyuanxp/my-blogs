package com.blog.config;

import com.blog.model.Permission;
import com.blog.model.Role;
import com.blog.model.RolePermission;
import com.blog.repository.PermissionRepository;
import com.blog.repository.RolePermissionRepository;
import com.blog.repository.RoleRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 启动时初始化权限种子数据。若权限表已有数据则跳过。
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class PermissionSeeder implements ApplicationRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (permissionRepository.count() > 0) {
            log.debug("权限种子已存在，跳过初始化");
            return;
        }

        log.info("初始化权限种子数据");

        // 菜单权限
        List<Permission> menus = List.of(
                perm("menu:dashboard", "仪表盘", "menu", null, 1),
                perm("menu:categories", "分类管理", "menu", null, 2),
                perm("menu:articles", "文章管理", "menu", null, 3),
                perm("menu:comments", "评论管理", "menu", null, 4),
                perm("menu:users", "用户管理", "menu", null, 5),
                perm("menu:roles", "角色管理", "menu", null, 6),
                perm("menu:permissions", "权限管理", "menu", null, 7),
                perm("menu:design", "设计规范", "menu", null, 8),
                perm("menu:about", "项目说明", "menu", null, 9)
        );
        permissionRepository.saveAll(menus);

        // 按钮权限
        List<Permission> buttons = List.of(
                perm("btn:category:create", "新建分类", "button", null, 10),
                perm("btn:category:edit", "编辑分类", "button", null, 11),
                perm("btn:category:delete", "删除分类", "button", null, 12),
                perm("btn:article:create", "新建文章", "button", null, 13),
                perm("btn:article:edit", "编辑文章", "button", null, 14),
                perm("btn:article:delete", "删除文章", "button", null, 15),
                perm("btn:article:publish", "发布文章", "button", null, 16),
                perm("btn:comment:delete", "删除评论", "button", null, 17),
                perm("btn:user:create", "新建用户", "button", null, 18),
                perm("btn:user:edit", "编辑用户", "button", null, 19),
                perm("btn:user:delete", "删除用户", "button", null, 20),
                perm("btn:user:reset_pwd", "重置密码", "button", null, 21),
                perm("btn:role:create", "新建角色", "button", null, 22),
                perm("btn:role:edit", "编辑角色", "button", null, 23),
                perm("btn:role:delete", "删除角色", "button", null, 24),
                perm("btn:role:assign", "分配权限", "button", null, 25),
                perm("btn:permission:create", "新建权限", "button", null, 26),
                perm("btn:permission:edit", "编辑权限", "button", null, 27),
                perm("btn:permission:delete", "删除权限", "button", null, 28)
        );
        permissionRepository.saveAll(buttons);

        // 创建 super_admin 角色（不分配权限，代码中特殊处理）
        if (roleRepository.findByCode("super_admin").isEmpty()) {
            Role superAdmin = new Role();
            superAdmin.setCode("super_admin");
            superAdmin.setName("超级管理员");
            superAdmin.setDescription("拥有所有权限，仅能手动创建");
            roleRepository.save(superAdmin);
            log.info("已创建 super_admin 角色");
        }

        log.info("权限种子数据初始化完成");
    }

    private static Permission perm(String code, String name, String type, Long parentId, int sortOrder) {
        Permission p = new Permission();
        p.setCode(code);
        p.setName(name);
        p.setType(type);
        p.setParentId(parentId);
        p.setSortOrder(sortOrder);
        return p;
    }
}
