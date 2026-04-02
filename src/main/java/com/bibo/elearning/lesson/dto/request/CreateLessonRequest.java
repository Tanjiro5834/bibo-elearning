package com.bibo.elearning.lesson.dto.request;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLessonRequest {
    private Long subjectId;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private Integer estimatedMinutes;

    private String learningLevel;

    public List<CreateLessonSectionRequest> sections;
}
