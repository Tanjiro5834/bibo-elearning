package com.bibo.elearning.quiz.dto.response;

import java.util.List;
import lombok.Data;

@Data
public class QuestionResponse {
    private Long id;
    private String questionText;
    private List<ChoiceResponse> choices;
}