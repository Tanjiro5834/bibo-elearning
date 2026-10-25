package com.bibo.elearning.parent.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Everything the parent dashboard needs beyond subject progress and quiz results. */
public record ParentOverviewResponse(
        int streak,
        int longestStreak,
        int todayCompleted,
        int dailyGoal,
        boolean dailyGoalSetByParent,
        int learningWeek,            // week N since the child's first recorded activity (1 if none yet)
        List<DayActivity> weeklyActivity,   // Mon..Sun of the current week
        List<Notification> notifications    // newest first, last 7 days
) {
    public record DayActivity(String day, LocalDate date, int lessonsCompleted) {}

    /** type: QUIZ_PASSED | QUIZ_FAILED | LESSON_COMPLETED | GOAL_REACHED | NEW_LESSON */
    public record Notification(String type, String title, String description, LocalDateTime at) {}
}
