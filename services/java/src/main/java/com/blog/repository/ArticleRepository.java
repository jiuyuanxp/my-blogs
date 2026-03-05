package com.blog.repository;

import com.blog.model.Article;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByStatusOrderByIsPinnedDescCreatedAtDesc(String status, Pageable pageable);

    Page<Article> findByStatus(String status, Pageable pageable);

    @Query(
            "SELECT a FROM Article a WHERE (:categoryId IS NULL OR a.categoryId = :categoryId)"
                    + " AND (:status IS NULL OR a.status = :status) ORDER BY a.isPinned DESC, a.createdAt DESC")
    Page<Article> findByCategoryAndStatus(
            @Param("categoryId") Long categoryId, @Param("status") String status, Pageable pageable);

    long countByCategoryId(Long categoryId);
}
