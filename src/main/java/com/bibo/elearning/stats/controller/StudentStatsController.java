package com.bibo.elearning.stats.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.bibo.elearning.stats.dto.response.LeaderboardResponse;
import com.bibo.elearning.stats.dto.response.StudentStatsResponse;
import com.bibo.elearning.stats.service.StudentStatsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentStatsController {

    private final StudentStatsService statsService;

    @GetMapping("/stats")
    public ResponseEntity<StudentStatsResponse> getMyStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(statsService.getStatsForUsername(userDetails.getUsername()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statsService.getLeaderboard(userDetails.getUsername(), Math.max(1, Math.min(limit, 50))));
    }
}