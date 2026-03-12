package com.blog.repository;

import com.blog.model.Comment;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

        @Query("SELECT c FROM Comment c WHERE c.articleId = :articleId"
                        + " AND (:includeDeleted = true OR c.deletedAt IS NULL) ORDER BY c.createdAt DESC")
        Page<Comment> findByArticleId(
                        @Param("articleId") Long articleId,
                        @Param("includeDeleted") boolean includeDeleted,
                        Pageable pageable);

        @Query("SELECT c FROM Comment c WHERE c.articleId IN (SELECT a.id FROM Article a WHERE a.categoryId = :categoryId)"
                        + " AND (:includeDeleted = true OR c.deletedAt IS NULL) ORDER BY c.createdAt DESC")
        Page<Comment> findByCategoryId(
                        @Param("categoryId") Long categoryId,
                        @Param("includeDeleted") boolean includeDeleted,
                        Pageable pageable);

        List<Comment> findByArticleIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long articleId);

        @Query("SELECT c FROM Comment c WHERE (:includeDeleted = true OR c.deletedAt IS NULL) ORDER BY c.createdAt DESC")
        Page<Comment> findAll(
                        @Param("includeDeleted") boolean includeDeleted, Pageable pageable);
}
