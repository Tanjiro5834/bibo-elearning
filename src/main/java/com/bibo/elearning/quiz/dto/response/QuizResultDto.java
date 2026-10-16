package com.bibo.elearning.quiz.dto.response;

import java.time.LocalDateTime;

public record QuizResultDto(
        String quizTitle,
        String subjectName,
        int score,
        int totalItems,
        int percent,
        boolean passed,
        LocalDateTime attemptedAt) {}