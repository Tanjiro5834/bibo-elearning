package com.bibo.elearning.quiz.dto.response;
import lombok.Data;
@Data
public class ChoiceResponse {
    private Long id;
    private String choiceText;
    private boolean isCorrect;
}