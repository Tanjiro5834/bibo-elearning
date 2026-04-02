package com.bibo.elearning.quiz.dto.request;
import java.util.List;
import lombok.Data;
@Data
public class CreateQuestionRequest {
    private String questionText;
    private List<CreateChoiceRequest> choices;
}