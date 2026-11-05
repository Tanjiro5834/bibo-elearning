package com.bibo.elearning.quiz.dto.response;

import java.util.List;

public record QuizEditResponse(
        Long id,
        String title,
        String description,
        int passingScore,
        Long lessonId,
        long attemptCount,
        List<QuestionEdit> questions) {

    public record QuestionEdit(String questionText, List<ChoiceEdit> choices) {}

    public record ChoiceEdit(String choiceText, boolean correct) {}
}
