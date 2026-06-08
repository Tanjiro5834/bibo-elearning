package com.bibo.elearning.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GeminiService {
    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    private static final String GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";

    public String chat(String message) {
        Map<String, Object> body = Map.of(
            "model", "llama-3.3-70b-versatile",
            "messages", List.of(Map.of("role", "user", "content", message))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, request, Map.class);

        List choices = (List) response.getBody().get("choices");
        Map message0 = (Map) ((Map) choices.get(0)).get("message");
        return (String) message0.get("content");
    }
}