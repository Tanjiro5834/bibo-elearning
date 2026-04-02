package com.bibo.elearning.quiz.dto.request;
import java.util.List;
import lombok.Data;
@Data
public class CreateQuizRequest {
    private String title;
    private String description;
    private int passingScore;
    private Long lessonId;
    private List<CreateQuestionRequest> questions;
}
