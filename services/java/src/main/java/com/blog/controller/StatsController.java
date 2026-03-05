package com.blog.controller;

import com.blog.service.StatsService;
import com.blog.service.StatsService.PopularArticleDto;
import com.blog.service.StatsService.PopularCommentDto;
import com.blog.service.StatsService.StatsSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "统计", description = "摘要、热门文章、热门评论")
@RestController
@Validated
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "统计摘要", description = "按 day/month/year 聚合文章、评论趋势")
    @GetMapping("/summary")
    public ResponseEntity<StatsSummary> summary(
            @Parameter(description = "周期：day/month/year") @RequestParam(required = false, defaultValue = "day") String period) {
        return ResponseEntity.ok(statsService.getSummary(period));
    }

    @Operation(summary = "热门文章（按浏览量）")
    @GetMapping("/popular-views")
    public ResponseEntity<List<PopularArticleDto>> popularViews(
            @Parameter(description = "返回条数") @RequestParam(required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(statsService.getPopularViews(limit));
    }

    @Operation(summary = "热门文章（按评论数）")
    @GetMapping("/popular-comments")
    public ResponseEntity<List<PopularCommentDto>> popularComments(
            @Parameter(description = "返回条数") @RequestParam(required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(statsService.getPopularComments(limit));
    }
}
