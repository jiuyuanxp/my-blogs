package com.blog.service;

import com.blog.dto.CategoryDto;
import com.blog.exception.BusinessException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.model.Category;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getTree() {
        List<Category> all = categoryRepository.findAllByOrderByIdAsc();
        return buildTree(all, null);
    }

    private List<CategoryDto> buildTree(List<Category> all, Long parentId) {
        return all.stream()
                .filter(c -> (parentId == null && c.getParentId() == null)
                        || (parentId != null && parentId.equals(c.getParentId())))
                .map(
                        c -> {
                            List<CategoryDto> children = buildTree(all, c.getId());
                            return CategoryDto.fromWithChildren(c, children);
                        })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Transactional
    public Category create(String name, Long parentId) {
        if (parentId != null) {
            Category parent = getById(parentId);
            if (parent == null) {
                throw new BusinessException("parent_not_found", "父分类不存在");
            }
        }
        Category category = new Category();
        category.setName(name);
        category.setParentId(parentId);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, String name, Long newParentId) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("分类不存在"));
        if (newParentId != null && newParentId.equals(id)) {
            throw new BusinessException("invalid_parent", "不能将父级设为自己");
        }
        if (newParentId != null && isDescendant(id, newParentId)) {
            throw new BusinessException("invalid_parent", "不能将父级设为自己的子节点");
        }
        category.setName(name);
        category.setParentId(newParentId);
        return categoryRepository.save(category);
    }

    private boolean isDescendant(Long ancestorId, Long nodeId) {
        Category node = getById(nodeId);
        while (node != null && node.getParentId() != null) {
            if (node.getParentId().equals(ancestorId)) {
                return true;
            }
            node = getById(node.getParentId());
        }
        return false;
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("分类不存在"));
        if (categoryRepository.existsByParentId(id)) {
            throw new BusinessException("category_in_use", "该分类下存在子分类，无法删除");
        }
        if (articleRepository.countByCategoryId(id) > 0) {
            throw new BusinessException("category_in_use", "该分类下存在文章，无法删除");
        }
        categoryRepository.deleteById(id);
    }
}
