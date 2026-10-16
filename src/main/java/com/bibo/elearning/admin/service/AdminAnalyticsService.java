package com.bibo.elearning.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bibo.elearning.admin.dto.response.AnalyticsResponse;
import com.bibo.elearning.admin.dto.response.AnalyticsResponse.DailyActivity;
import com.bibo.elearning.admin.dto.response.AnalyticsResponse.SubjectCompletion;
import com.bibo.elearning.admin.dto.response.AnalyticsResponse.TopStudent;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonRepository.SubjectLessonCount;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsService {
    private static final int TOP_STUDENTS = 5;
    private static final int ACTIVITY_DAYS = 7;

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public AnalyticsResponse getAnalytics() {
        long activeStudents = userRepository.countEnabledByRole(RoleName.STUDENT);

        List<SubjectLessonCount> published = lessonRepository.countPublishedBySubject();
        long totalPublished = published.stream().mapToLong(SubjectLessonCount::getLessonCount).sum();

        Map<Long, Long> completedBySubject = lessonProgressRepository
                .countCompletedBySubject(ProgressStatus.COMPLETED).stream()
                .collect(Collectors.toMap(
                        LessonProgressRepository.SubjectCompletedCount::getSubjectId,
                        LessonProgressRepository.SubjectCompletedCount::getCompleted));

        long lessonsCompleted = completedBySubject.values().stream().mapToLong(Long::longValue).sum();

        List<SubjectCompletion> completionBySubject = published.stream()
                .map(s -> new SubjectCompletion(
                        s.getSubjectName(),
                        pct(completedBySubject.getOrDefault(s.getSubjectId(), 0L),
                            activeStudents * s.getLessonCount())))
                .toList();

        List<TopStudent> topStudents = lessonProgressRepository
                .findTopByCompleted(ProgressStatus.COMPLETED, PageRequest.of(0, TOP_STUDENTS)).stream()
                .map(s -> new TopStudent(s.getUserId(), s.getFirstName(), s.getLastName(),
                        s.getUsername(), pct(s.getCompleted(), totalPublished)))
                .toList();

        return new AnalyticsResponse(
                activeStudents,
                pct(lessonsCompleted, activeStudents * totalPublished),
                quizAttemptRepository.count(),
                lessonsCompleted,
                completionBySubject,
                weeklyActivity(),
                topStudents);
    }

    private List<DailyActivity> weeklyActivity() {
        LocalDate start = LocalDate.now().minusDays(ACTIVITY_DAYS - 1L);
        LocalDateTime since = start.atStartOfDay();

        Map<LocalDate, Set<Long>> byDay = new LinkedHashMap<>();
        for(int i = 0; i < ACTIVITY_DAYS; i++){
            byDay.put(start.plusDays(i), new HashSet<>());
        }

        lessonProgressRepository.findActivitySince(since)
                .forEach(a -> mark(byDay, a.getOccurredAt(), a.getStudentId()));

        quizAttemptRepository.findActivitySince(since)
                .forEach(a -> mark(byDay, a.getOccurredAt(), a.getStudentId()));

        return byDay.entrySet().stream()
                .map(e -> new DailyActivity(
                        e.getKey().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        e.getValue().size()))
                .toList();
    }

    private static void mark(Map<LocalDate, Set<Long>> byDay, LocalDateTime at, Long studentId) {
        if (at == null || studentId == null) return;

        Set<Long> students = byDay.get(at.toLocalDate());
        if (students != null) students.add(studentId);
    }

    private static int pct(long part, long whole) {
        return whole <= 0 ? 0 : (int) Math.min(100, Math.round(part * 100.0 / whole));
    }
}