package com.bibo.elearning.stats.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.exception.UserNotFoundException;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.parent.entity.DailyGoal;
import com.bibo.elearning.parent.repository.DailyGoalRepository;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.stats.dto.response.LeaderboardResponse;
import com.bibo.elearning.stats.dto.response.StudentStatsResponse;
import com.bibo.elearning.stats.dto.response.StudentStatsResponse.Badge;
import com.bibo.elearning.stats.dto.response.StudentStatsResponse.NextLesson;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentStatsService {

    static final int XP_PER_LESSON = 50;
    static final int XP_QUIZ_PASSED = 25;
    static final int XP_QUIZ_PERFECT_BONUS = 25;
    static final int DEFAULT_DAILY_GOAL = 3;
    static final int QUIZ_WHIZ_TARGET = 5;
    static final int EARLY_BIRD_HOUR = 8;

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final DailyGoalRepository dailyGoalRepository;

    record QuizBest(int bestScore, boolean passed) {}

    public StudentStatsResponse getStatsForUsername(String username) {
        return computeStats(getProfile(username));
    }

    public StudentStatsResponse computeStats(StudentProfile profile) {
        LocalDate today = LocalDate.now();

        List<LessonProgress> progress = lessonProgressRepository.findAllWithLessonByStudentProfileId(profile.getId());
        List<LessonProgress> completed = progress.stream().filter(p -> p.getStatus() == ProgressStatus.COMPLETED).toList();
        List<LessonProgress> inProgress = progress.stream().filter(p -> p.getStatus() == ProgressStatus.IN_PROGRESS).toList();

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(profile.getId());
        Map<Long, QuizBest> bestPerQuiz = bestPerQuiz(attempts);

        Set<LocalDate> activeDays = new HashSet<>();
        completed.forEach(p -> addDay(activeDays, p.getCompletedAt()));
        attempts.forEach(a -> addDay(activeDays, a.getAttemptedAt()));

        int totalLessons = (int) lessonRepository.countByPublishedTrue();
        int completionRate = totalLessons == 0 ? 0
                : (int) Math.min(100, Math.round(completed.size() * 100.0 / totalLessons));
        int todayCompleted = (int) completed.stream()
                .filter(p -> p.getCompletedAt() != null && p.getCompletedAt().toLocalDate().equals(today))
                .count();

        Optional<DailyGoal> goal = dailyGoalRepository.findFirstByChildIdOrderByUpdatedAtDesc(profile.getUser().getId());

        return new StudentStatsResponse(
                xp(completed.size(), bestPerQuiz.values()),
                currentStreak(activeDays, today),
                longestStreak(activeDays),
                completed.size(), inProgress.size(), totalLessons, completionRate,
                (int) bestPerQuiz.values().stream().filter(QuizBest::passed).count(),
                (int) bestPerQuiz.values().stream().filter(q -> q.bestScore() >= 100).count(),
                todayCompleted,
                goal.map(DailyGoal::getGoal).orElse(DEFAULT_DAILY_GOAL),
                goal.isPresent(),
                nextLesson(progress, inProgress),
                badges(completed, attempts, activeDays));
    }

    public LeaderboardResponse getLeaderboard(String username, int limit) {
        Long myProfileId = studentProfileRepository.findByUserId(findUser(username).getId())
                .map(StudentProfile::getId).orElse(null);

        Map<Long, Long> completedPerStudent = new HashMap<>();
        for (Object[] row : lessonProgressRepository.countPerStudentByStatus(ProgressStatus.COMPLETED)) {
            completedPerStudent.put((Long) row[0], ((Number) row[1]).longValue());
        }
        Map<Long, List<QuizBest>> quizzesPerStudent = new HashMap<>();
        for (Object[] row : quizAttemptRepository.findBestAttemptPerStudentAndQuiz()) {
            quizzesPerStudent.computeIfAbsent((Long) row[0], k -> new ArrayList<>())
                    .add(new QuizBest(((Number) row[2]).intValue(), ((Number) row[3]).intValue() == 1));
        }

        record Scored(StudentProfile profile, int xp) {}
        List<Scored> ranked = studentProfileRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().isEnabled())
                .map(p -> new Scored(p, xp(completedPerStudent.getOrDefault(p.getId(), 0L),
                        quizzesPerStudent.getOrDefault(p.getId(), List.of()))))
                .sorted(Comparator.comparingInt(Scored::xp).reversed()
                        .thenComparing(s -> displayName(s.profile())))
                .toList();

        List<LeaderboardResponse.Entry> entries = new ArrayList<>();
        Integer myRank = null;
        int myXp = 0, rank = 0;
        for (int i = 0; i < ranked.size(); i++) {
            Scored s = ranked.get(i);
            if (i == 0 || s.xp() != ranked.get(i - 1).xp()) rank = i + 1;
            boolean me = s.profile().getId().equals(myProfileId);
            if (me) { myRank = rank; myXp = s.xp(); }
            if (i < limit) {
                String name = displayName(s.profile());
                entries.add(new LeaderboardResponse.Entry(rank, name, initials(name), s.xp(), me));
            }
        }
        return new LeaderboardResponse(entries, myRank, myXp, ranked.size());
    }

    // ── XP + streaks ──
    static int xp(long lessonsCompleted, Collection<QuizBest> quizzes) {
        int quizXp = quizzes.stream()
                .mapToInt(q -> (q.passed() ? XP_QUIZ_PASSED : 0) + (q.bestScore() >= 100 ? XP_QUIZ_PERFECT_BONUS : 0))
                .sum();
        return (int) lessonsCompleted * XP_PER_LESSON + quizXp;
    }

    private Map<Long, QuizBest> bestPerQuiz(List<QuizAttempt> attempts) {
        Map<Long, QuizBest> best = new HashMap<>();
        for (QuizAttempt a : attempts) {
            if (a.getQuiz() == null) continue;
            best.merge(a.getQuiz().getId(), new QuizBest(a.getScore(), a.isPassed()),
                    (x, y) -> new QuizBest(Math.max(x.bestScore(), y.bestScore()), x.passed() || y.passed()));
        }
        return best;
    }

    static int currentStreak(Set<LocalDate> days, LocalDate today) {
        LocalDate cursor = days.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (days.contains(cursor)) { streak++; cursor = cursor.minusDays(1); }
        return streak;
    }

    static int longestStreak(Set<LocalDate> days) {
        int best = 0, run = 0;
        LocalDate prev = null;
        for (LocalDate d : days.stream().sorted().toList()) {
            run = (prev != null && prev.plusDays(1).equals(d)) ? run + 1 : 1;
            best = Math.max(best, run);
            prev = d;
        }
        return best;
    }

    private static void addDay(Set<LocalDate> days, LocalDateTime t) {
        if (t != null) days.add(t.toLocalDate());
    }

    // ── Next lesson ──
    private NextLesson nextLesson(List<LessonProgress> all, List<LessonProgress> inProgress) {
        Optional<LessonProgress> resume = inProgress.stream()
                .filter(p -> Boolean.TRUE.equals(p.getLesson().getPublished()))
                .max(Comparator.comparing(LessonProgress::getLastAccessedAt,
                        Comparator.nullsFirst(Comparator.naturalOrder())));
        if (resume.isPresent()) return toNextLesson(resume.get().getLesson(), true);

        Set<Long> touched = all.stream().map(p -> p.getLesson().getId()).collect(Collectors.toSet());
        return lessonRepository.findByPublishedTrue().stream()
                .filter(l -> !touched.contains(l.getId()))
                .min(Comparator.comparing((Lesson l) -> l.getSubject().getId()).thenComparing(Lesson::getId))
                .map(l -> toNextLesson(l, false))
                .orElse(null);
    }

    private NextLesson toNextLesson(Lesson l, boolean inProgress) {
        return new NextLesson(l.getId(), l.getTitle(), l.getSubject().getId(), l.getSubject().getName(), inProgress);
    }

    // ── Badges ──
    private List<Badge> badges(List<LessonProgress> completed, List<QuizAttempt> attempts, Set<LocalDate> activeDays) {
        List<LocalDateTime> completions = completed.stream()
                .map(LessonProgress::getCompletedAt).filter(Objects::nonNull).sorted().toList();

        LocalDate firstSteps = completions.isEmpty() ? null : completions.get(0).toLocalDate();

        LocalDate earlyBird = completions.stream()
                .filter(t -> t.getHour() < EARLY_BIRD_HOUR)
                .findFirst().map(LocalDateTime::toLocalDate).orElse(null);

        LocalDate quizWhiz = null;
        Set<Long> perfectQuizIds = new HashSet<>();
        List<QuizAttempt> byTime = attempts.stream()
                .filter(a -> a.getAttemptedAt() != null && a.getQuiz() != null)
                .sorted(Comparator.comparing(QuizAttempt::getAttemptedAt)).toList();
        for (QuizAttempt a : byTime) {
            if (a.getScore() >= 100 && perfectQuizIds.add(a.getQuiz().getId())
                    && perfectQuizIds.size() == QUIZ_WHIZ_TARGET) {
                quizWhiz = a.getAttemptedAt().toLocalDate();
                break;
            }
        }

        LocalDate subjectMaster = null;
        Map<Long, List<LessonProgress>> bySubject = completed.stream()
                .collect(Collectors.groupingBy(p -> p.getLesson().getSubject().getId()));
        for (Map.Entry<Long, List<LessonProgress>> e : bySubject.entrySet()) {
            long published = lessonRepository.countBySubjectIdAndPublishedTrue(e.getKey());
            long done = e.getValue().stream().filter(p -> Boolean.TRUE.equals(p.getLesson().getPublished())).count();
            if (published > 0 && done >= published) {
                LocalDate finished = e.getValue().stream()
                        .map(LessonProgress::getCompletedAt).filter(Objects::nonNull)
                        .max(Comparator.naturalOrder()).map(LocalDateTime::toLocalDate).orElse(null);
                if (finished != null && (subjectMaster == null || finished.isBefore(subjectMaster))) {
                    subjectMaster = finished;
                }
            }
        }

        LocalDate onFire = dayStreakReached(activeDays, 3);

        return List.of(
                badge("FIRST_STEPS", "🌱", "First Steps", "Complete your first lesson", firstSteps),
                badge("EARLY_BIRD", "⚡", "Early Bird", "Complete a lesson before 8 AM", earlyBird),
                badge("ON_FIRE", "🔥", "On Fire", "Learn 3 days in a row", onFire),
                badge("QUIZ_WHIZ", "🎯", "Quiz Whiz", "Score 100% on 5 different quizzes", quizWhiz),
                badge("SUBJECT_MASTER", "🏆", "Subject Master", "Finish every lesson in a subject", subjectMaster));
    }

    private static LocalDate dayStreakReached(Set<LocalDate> days, int target) {
        int run = 0;
        LocalDate prev = null;
        for (LocalDate d : days.stream().sorted().toList()) {
            run = (prev != null && prev.plusDays(1).equals(d)) ? run + 1 : 1;
            if (run >= target) return d;
            prev = d;
        }
        return null;
    }

    private static Badge badge(String code, String icon, String title, String desc, LocalDate earnedAt) {
        return new Badge(code, icon, title, desc, earnedAt != null, earnedAt);
    }

    // ── Helpers ──
    private User findUser(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new UserNotFoundException(username));
    }

    private StudentProfile getProfile(String username) {
        return studentProfileRepository.findByUserId(findUser(username).getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
    }

    static String displayName(StudentProfile p) {
        User u = p.getUser();
        String full = p.getFullName();
        if (full == null || full.isBlank()) {
            full = ((u.getFirstName() == null ? "" : u.getFirstName()) + " "
                  + (u.getLastName() == null ? "" : u.getLastName())).trim();
        }
        if (full.isBlank()) return u.getUsername();
        String[] parts = full.trim().split("\\s+");
        return parts.length == 1 ? parts[0] : parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }

    static String initials(String displayName) {
        String[] parts = displayName.replace(".", "").trim().split("\\s+");
        return (parts[0].substring(0, 1) + (parts.length > 1 ? parts[parts.length - 1].substring(0, 1) : "")).toUpperCase();
    }
}