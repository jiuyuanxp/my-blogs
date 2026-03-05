package com.blog.controller;

import com.blog.service.StatsService;
import com.blog.service.StatsService.PopularArticleDto;
import com.blog.service.StatsService.PopularCommentDto;
import com.blog.service.StatsService.StatsSummary;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/summary")
    public ResponseEntity<StatsSummary> summary(
            @RequestParam(required = false, defaultValue = "day") String period) {
        return ResponseEntity.ok(statsService.getSummary(period));
    }

    @GetMapping("/popular-views")
    public ResponseEntity<List<PopularArticleDto>> popularViews(
            @RequestParam(required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(statsService.getPopularViews(limit));
    }

    @GetMapping("/popular-comments")
    public ResponseEntity<List<PopularCommentDto>> popularComments(
            @RequestParam(required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(statsService.getPopularComments(limit));
    }
}
