package com.bibo.elearning.lesson.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentLessonDashboardResponse {
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer inProgressLessons;
    private Integer notStartedLessons;
    private Double completionRate;
    private List<LessonProgressResponse> recentLessons;
}