package com.bibo.elearning.ai.controller;

import com.bibo.elearning.ai.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        if (message == null || message.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Message is required"));

        String reply = geminiService.chat(message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}