package com.bibo.elearning.quiz.dto.response;
import lombok.Data;
@Data
public class QuizResultResponse {
    private int score;
    private int totalItems;
    private boolean passed;
    private String message;
}