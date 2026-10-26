package com.bibo.elearning.ai.dto;

import java.util.List;

/**
 * @param message the student's new message
 * @param history earlier turns of this conversation (oldest first); only user/assistant roles are used
 * @param mode    "chat" (AI Tutor page) or "research" (Research page); defaults to chat
 */
public record ChatRequest(String message, List<Turn> history, String mode) {
    public record Turn(String role, String content) {}
}
