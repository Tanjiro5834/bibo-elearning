package com.bibo.elearning.quiz.mapper;

import org.springframework.stereotype.Component;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.dto.response.QuizResultResponse;
import com.bibo.elearning.quiz.entity.Quiz;
import com.bibo.elearning.quiz.entity.QuizAttempt;

@Component
public class QuizMapper {
    public Quiz toEntity(CreateQuizRequest request, Lesson lesson) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setLesson(lesson);
        return quiz;
    }

    public QuizResultResponse toResultResponse(QuizAttempt attempt) {
        QuizResultResponse response = new QuizResultResponse();
        response.setScore(attempt.getScore());
        response.setTotalItems(attempt.getTotalItems());
        response.setPassed(attempt.isPassed());
        response.setMessage(attempt.isPassed() ? "Congrats! You passed!" : "Keep trying!");
        return response;
    }
}