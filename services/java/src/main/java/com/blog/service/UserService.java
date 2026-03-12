package com.blog.service;

import com.blog.dto.PageResponse;
import com.blog.dto.UserDto;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Role;
import com.blog.model.User;
import com.blog.repository.RoleRepository;
import com.blog.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String SUPER_ADMIN = "super_admin";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserDto> list(int page, int pageSize) {
        int size = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<UserDto> dtos = userPage.getContent().stream().map(UserDto::from).collect(Collectors.toList());
        return PageResponse.of(userPage, dtos);
    }

    @Transactional(readOnly = true)
    public UserDto getById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto create(String username, String password, String nickname, Long roleId) {
        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("username_exists", "用户名已存在");
        }
        Role role = roleRepository.findById(roleId).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
        if (SUPER_ADMIN.equals(role.getCode())) {
            throw new BusinessException("forbidden", "不能创建超级管理员角色用户");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setNickname(nickname);
        user.setRole(role);
        user.setStatus("active");
        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public UserDto update(Long id, String nickname, Long roleId, String status) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        if (SUPER_ADMIN.equals(user.getRole().getCode())) {
            throw new BusinessException("forbidden", "不能修改超级管理员");
        }

        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (roleId != null) {
            Role role = roleRepository.findById(roleId).orElseThrow(() -> new ResourceNotFoundException("角色不存在"));
            if (SUPER_ADMIN.equals(role.getCode())) {
                throw new BusinessException("forbidden", "不能分配超级管理员角色");
            }
            user.setRole(role);
        }
        if (status != null && ("active".equals(status) || "disabled".equals(status))) {
            user.setStatus(status);
        }
        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        if (SUPER_ADMIN.equals(user.getRole().getCode())) {
            throw new BusinessException("forbidden", "不能删除超级管理员");
        }
        userRepository.delete(user);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        if (SUPER_ADMIN.equals(user.getRole().getCode())) {
            throw new BusinessException("forbidden", "不能重置超级管理员密码");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
