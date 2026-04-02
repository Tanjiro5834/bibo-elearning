package com.bibo.elearning.lesson.dto.request;
import lombok.Data;
@Data
public class UpdateLessonProgressRequest {
    private Integer progressPercent;
    private Integer currentSectionOrder;
}
