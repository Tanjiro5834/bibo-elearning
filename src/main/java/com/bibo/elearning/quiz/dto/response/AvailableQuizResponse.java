package com.bibo.elearning.quiz.dto.response;

/** One row of the student's quiz picker (no questions or answers). */
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
        Integer bestScore,   // null = not taken yet
        boolean passed) {}
