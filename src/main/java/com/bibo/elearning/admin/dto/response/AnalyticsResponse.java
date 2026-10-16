package com.bibo.elearning.admin.dto.response;

import java.util.List;

public record AnalyticsResponse(
        long activeStudents,
        int avgProgress,
        long quizzesTaken,
        long lessonsCompleted,
        List<SubjectCompletion> completionBySubject,
        List<DailyActivity> weeklyActive,
        List<TopStudent> topStudents
) {
    public record SubjectCompletion(String subject, int pct) {}
    public record DailyActivity(String day, int count) {}
    public record TopStudent(Long id, String firstName, String lastName, String username, int progress) {}
}