package com.bibo.elearning.quiz.dto.response;

public record AvailableQuizResponse(
        Long id,
        String title,
        String description,
        Long lessonId,
        String lessonTitle,
        String subjectName,
        int questionCount,
        int passingScore,
        int attempts,
        Integer bestScore,   
        boolean passed) {}
