package com.bibo.elearning.lesson.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LessonDetailResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private Integer estimatedMinutes;
    private String learningLevel;
    private Boolean published;
    private List<LessonSectionResponse> sections;
}