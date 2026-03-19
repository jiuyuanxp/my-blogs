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

    /** 按钮 code 前缀 -> 父菜单 code 的映射（用于迁移旧数据） */
    private static final java.util.Map<String, String> BUTTON_TO_MENU = java.util.Map.ofEntries(
            java.util.Map.entry("btn:category:", "menu:categories"),
            java.util.Map.entry("btn:article:", "menu:articles"),
            java.util.Map.entry("btn:comment:", "menu:comments"),
            java.util.Map.entry("btn:user:", "menu:users"),
            java.util.Map.entry("btn:role:", "menu:roles"),
            java.util.Map.entry("btn:permission:", "menu:permissions")
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (permissionRepository.count() > 0) {
            migrateButtonsParentId();
            return;
        }

        log.info("初始化权限种子数据");

        // 一级菜单（根节点）
        Permission menuDashboard = perm("menu:dashboard", "仪表盘", "menu", null, "/", null, false, 1);
        Permission menuCategories = perm("menu:categories", "分类管理", "menu", null, "/categories", null, false, 2);
        Permission menuArticles = perm("menu:articles", "文章管理", "menu", null, "/articles", null, false, 3);
        Permission menuComments = perm("menu:comments", "评论管理", "menu", null, "/comments", null, false, 4);
        Permission menuUsers = perm("menu:users", "用户管理", "menu", null, "/users", null, false, 5);
        Permission menuRoles = perm("menu:roles", "角色管理", "menu", null, "/roles", null, false, 6);
        Permission menuPermissions = perm("menu:permissions", "权限管理", "menu", null, "/permissions", null, false, 7);
        Permission menuDesign = perm("menu:design", "设计规范", "menu", null, "/design", null, false, 8);
        Permission menuAbout = perm("menu:about", "项目说明", "menu", null, "/about", null, false, 9);

        permissionRepository.saveAll(List.of(menuDashboard, menuCategories, menuArticles, menuComments,
                menuUsers, menuRoles, menuPermissions, menuDesign, menuAbout));

        Long idCategories = menuCategories.getId();
        Long idArticles = menuArticles.getId();
        Long idComments = menuComments.getId();
        Long idUsers = menuUsers.getId();
        Long idRoles = menuRoles.getId();
        Long idPermissions = menuPermissions.getId();

        // 按钮权限（挂载到对应菜单下）
        List<Permission> buttons = List.of(
                perm("btn:category:create", "新建分类", "button", idCategories, null, null, false, 1),
                perm("btn:category:edit", "编辑分类", "button", idCategories, null, null, false, 2),
                perm("btn:category:delete", "删除分类", "button", idCategories, null, null, false, 3),
                perm("btn:article:create", "新建文章", "button", idArticles, null, null, false, 4),
                perm("btn:article:edit", "编辑文章", "button", idArticles, null, null, false, 5),
                perm("btn:article:delete", "删除文章", "button", idArticles, null, null, false, 6),
                perm("btn:article:publish", "发布文章", "button", idArticles, null, null, false, 7),
                perm("btn:comment:delete", "删除评论", "button", idComments, null, null, false, 8),
                perm("btn:user:create", "新建用户", "button", idUsers, null, null, false, 9),
                perm("btn:user:edit", "编辑用户", "button", idUsers, null, null, false, 10),
                perm("btn:user:delete", "删除用户", "button", idUsers, null, null, false, 11),
                perm("btn:user:reset_pwd", "重置密码", "button", idUsers, null, null, false, 12),
                perm("btn:role:create", "新建角色", "button", idRoles, null, null, false, 13),
                perm("btn:role:edit", "编辑角色", "button", idRoles, null, null, false, 14),
                perm("btn:role:delete", "删除角色", "button", idRoles, null, null, false, 15),
                perm("btn:role:assign", "分配权限", "button", idRoles, null, null, false, 16),
                perm("btn:permission:create", "新建权限", "button", idPermissions, null, null, false, 17),
                perm("btn:permission:edit", "编辑权限", "button", idPermissions, null, null, false, 18),
                perm("btn:permission:delete", "删除权限", "button", idPermissions, null, null, false, 19)
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

    /**
     * 迁移：将 parent_id 为 null 的按钮挂到对应菜单下。
     * 解决初版 Seeder 平级结构遗留问题。
     */
    private void migrateButtonsParentId() {
        List<Permission> orphanButtons = permissionRepository.findByTypeAndParentIdIsNull("button");
        if (orphanButtons.isEmpty()) {
            log.debug("权限种子已存在，无需迁移");
            return;
        }
        log.info("迁移 {} 个按钮的 parent_id 到对应菜单下", orphanButtons.size());
        int updated = 0;
        for (Permission btn : orphanButtons) {
            String menuCode = null;
            for (java.util.Map.Entry<String, String> e : BUTTON_TO_MENU.entrySet()) {
                if (btn.getCode().startsWith(e.getKey())) {
                    menuCode = e.getValue();
                    break;
                }
            }
            if (menuCode == null) {
                log.warn("无法确定按钮 {} 的父菜单，跳过", btn.getCode());
                continue;
            }
            Long parentId = permissionRepository.findByCode(menuCode)
                    .map(Permission::getId)
                    .orElse(null);
            if (parentId == null) {
                log.warn("未找到菜单 {}，跳过按钮 {}", menuCode, btn.getCode());
                continue;
            }
            btn.setParentId(parentId);
            permissionRepository.save(btn);
            updated++;
        }
        log.info("已迁移 {} 个按钮的 parent_id", updated);
    }

    private static Permission perm(String code, String name, String type, Long parentId,
            String routePath, String component, boolean isHidden, int sortOrder) {
        Permission p = new Permission();
        p.setCode(code);
        p.setName(name);
        p.setType(type);
        p.setParentId(parentId);
        p.setRoutePath(routePath);
        p.setComponent(component);
        p.setIsHidden(isHidden);
        p.setSortOrder(sortOrder);
        return p;
    }
}
