package com.bibo.elearning.lesson.dto.request;

import lombok.Data;

@Data
public class UpdateLessonRequest {
    private String title;
    private String description;
    private Integer estimatedMinutes;
    private String learningLevel;
    private Boolean published;
}