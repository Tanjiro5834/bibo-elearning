package com.bibo.elearning.quiz.dto.response;


import java.util.List;
import lombok.Data;

@Data
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private int passingScore;
    private List<QuestionResponse> questions;
}
