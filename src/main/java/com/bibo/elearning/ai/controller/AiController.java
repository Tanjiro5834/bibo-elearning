package com.bibo.elearning.ai.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.ai.dto.ChatRequest;
import com.bibo.elearning.ai.service.AiRateLimiter;
import com.bibo.elearning.ai.service.AiTutorService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')") // AI Tutor + Research are student features; protects the shared quota
public class AiController {

    private final AiTutorService aiTutorService;
    private final AiRateLimiter rateLimiter;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody ChatRequest request) {
        rateLimiter.check(user.getUsername());
        return ResponseEntity.ok(Map.of("reply", aiTutorService.chat(request)));
    }
}
