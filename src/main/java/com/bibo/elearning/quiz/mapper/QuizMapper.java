package com.bibo.elearning.quiz.mapper;

import org.springframework.stereotype.Component;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.dto.response.ChoiceResponse;
import com.bibo.elearning.quiz.dto.response.QuestionResponse;
import com.bibo.elearning.quiz.dto.response.QuizResponse;
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

    public QuizResponse toResponse(Quiz quiz) {
        QuizResponse dto = new QuizResponse();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setPassingScore(quiz.getPassingScore());
        dto.setQuestions(quiz.getQuestions().stream().map(q -> {
            QuestionResponse qDto = new QuestionResponse();
            qDto.setId(q.getId());
            qDto.setQuestionText(q.getQuestionText());
            qDto.setChoices(q.getChoices().stream().map(c -> {
                ChoiceResponse cDto = new ChoiceResponse();
                cDto.setId(c.getId());
                cDto.setChoiceText(c.getChoiceText());
                cDto.setCorrect(c.isCorrect());
                return cDto;
            }).toList());
            return qDto;
        }).toList());
        return dto;
    }
}