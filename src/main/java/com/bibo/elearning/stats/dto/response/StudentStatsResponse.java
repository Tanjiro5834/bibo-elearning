package com.bibo.elearning.stats.dto.response;

import java.time.LocalDate;
import java.util.List;

public record StudentStatsResponse(
        int xp, int streak, int longestStreak,
        int lessonsCompleted, int lessonsInProgress, int totalLessons, int completionRate,
        int quizzesPassed, int perfectQuizzes,
        int todayCompleted, int dailyGoal, boolean dailyGoalSetByParent,
        NextLesson nextLesson, List<Badge> badges
) {
    public record NextLesson(Long lessonId, String title, Long subjectId, String subjectName, boolean inProgress) {}
    public record Badge(String code, String icon, String title, String description, boolean earned, LocalDate earnedAt) {}
}
