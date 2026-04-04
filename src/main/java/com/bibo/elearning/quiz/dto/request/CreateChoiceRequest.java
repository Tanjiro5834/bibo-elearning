package com.bibo.elearning.quiz.dto.request;
import lombok.Data;
@Data
public class CreateChoiceRequest {
    private String choiceText;
    private boolean isCorrect;
}
