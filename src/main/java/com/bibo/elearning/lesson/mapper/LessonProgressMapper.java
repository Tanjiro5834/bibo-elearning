package com.bibo.elearning.lesson.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.lesson.dto.response.LessonProgressResponse;
import com.bibo.elearning.lesson.dto.response.StudentLessonDashboardResponse;
import com.bibo.elearning.lesson.entity.LessonProgress;

@Component
public class LessonProgressMapper {

    public LessonProgressResponse toResponse(LessonProgress progress) {
        return LessonProgressResponse.builder()
                .lessonId(progress.getLesson().getId())
                .lessonTitle(progress.getLesson().getTitle())
                .subjectName(progress.getLesson().getSubject().getName())
                .status(progress.getStatus().name())
                .progressPercent(progress.getProgressPercent())
                .currentSectionOrder(progress.getCurrentSectionOrder())
                .lastAccessedAt(progress.getLastAccessedAt())
                .completedAt(progress.getCompletedAt())
                .build();
    }

    public List<LessonProgressResponse> toResponseList(List<LessonProgress> progressList) {
        return progressList.stream()
                .map(this::toResponse)
                .toList();
    }

    public StudentLessonDashboardResponse toDashboardResponse(
            List<LessonProgress> allProgress,
            List<LessonProgress> recentLessons
    ) {
        int total = allProgress.size();
        int completed = (int) allProgress.stream()
                .filter(p -> p.getStatus() == ProgressStatus.COMPLETED)
                .count();
        int inProgress = (int) allProgress.stream()
                .filter(p -> p.getStatus() == ProgressStatus.IN_PROGRESS)
                .count();
        int notStarted = (int) allProgress.stream()
                .filter(p -> p.getStatus() == ProgressStatus.NOT_STARTED)
                .count();
        double completionRate = total > 0
                ? Math.round((completed * 100.0 / total) * 10.0) / 10.0
                : 0.0;

        return StudentLessonDashboardResponse.builder()
                .totalLessons(total)
                .completedLessons(completed)
                .inProgressLessons(inProgress)
                .notStartedLessons(notStarted)
                .completionRate(completionRate)
                .recentLessons(toResponseList(recentLessons))
                .build();
    }
}