package com.bibo.elearning.quiz.dto.request;
import java.util.List;
import lombok.Data;
@Data
public class SubmitQuizRequest {
    private Long studentId;
    private Long quizId;
    private List<Long> selectedChoiceIds; // one per question
}