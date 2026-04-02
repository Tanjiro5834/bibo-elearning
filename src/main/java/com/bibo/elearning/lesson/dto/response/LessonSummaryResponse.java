package com.bibo.elearning.lesson.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LessonSummaryResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String title;
    private String description;
    private Integer estimatedMinutes;
    private Boolean published;
}
