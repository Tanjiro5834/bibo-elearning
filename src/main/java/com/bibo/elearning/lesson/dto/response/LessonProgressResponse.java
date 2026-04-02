package com.bibo.elearning.lesson.dto.response;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LessonProgressResponse {
    private Long lessonId;
    private String lessonTitle;
    private String subjectName;
    private String status;
    private Integer progressPercent;
    private Integer currentSectionOrder;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime completedAt;
}
