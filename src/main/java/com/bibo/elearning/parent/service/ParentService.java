package com.bibo.elearning.parent.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.exception.UserNotFoundException;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.SubjectRepository;
import com.bibo.elearning.parent.dto.request.LinkChildRequest;
import com.bibo.elearning.parent.dto.request.SendMessageRequest;
import com.bibo.elearning.parent.dto.request.SetDailyGoalRequest;
import com.bibo.elearning.parent.dto.request.SubjectProgressDto;
import com.bibo.elearning.parent.dto.request.TeacherReviewRequestDto;
import com.bibo.elearning.parent.dto.response.ChildResponse;
import com.bibo.elearning.parent.dto.response.ParentOverviewResponse;
import com.bibo.elearning.parent.dto.response.ParentOverviewResponse.DayActivity;
import com.bibo.elearning.parent.dto.response.ParentOverviewResponse.Notification;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.stats.dto.response.StudentStatsResponse;
import com.bibo.elearning.stats.service.StudentStatsService;
import com.bibo.elearning.parent.entity.ParentChildLink;
import com.bibo.elearning.parent.repository.DailyGoalRepository;
import com.bibo.elearning.parent.repository.EncouragementMessageRepository;
import com.bibo.elearning.parent.repository.ParentChildLinkRepository;
import com.bibo.elearning.parent.repository.TeacherReviewRequestRepository;
import com.bibo.elearning.quiz.dto.response.QuizResultDto;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Objects;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.bibo.elearning.parent.entity.DailyGoal;
import com.bibo.elearning.parent.entity.EncouragementMessage;
import com.bibo.elearning.parent.entity.TeacherReviewRequest;
@Service
@RequiredArgsConstructor
public class ParentService {
    private final ParentChildLinkRepository parentChildLinkRepository;
    private final EncouragementMessageRepository encouragementMessageRepository;
    private final TeacherReviewRequestRepository teacherReviewRequestRepository;
    private final DailyGoalRepository dailyGoalRepository;
    private final UserRepository userRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentStatsService studentStatsService;

    static final int NOTIFICATION_DAYS = 7;
    static final int NOTIFICATION_LIMIT = 8;

    public void linkChild(String parentUsername, LinkChildRequest request) {
        if (request == null || request.getChildUsername() == null || request.getChildUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Child username is required");
        }
        
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findByUsername(request.getChildUsername())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildUsername()));

        if (child.getRole() == null || child.getRole().getName() != RoleName.STUDENT) {
            throw new IllegalArgumentException("Only student accounts can be linked as a child");
        }

        boolean alreadyLinked = parentChildLinkRepository.existsByParentAndChild(parent, child);
        if (alreadyLinked) {
            throw new IllegalStateException("Child is already linked to this parent");
        }

        ParentChildLink link = new ParentChildLink();
        link.setParent(parent);
        link.setChild(child);
        parentChildLinkRepository.save(link);
    }

    public List<ChildResponse> getChildren(String parentUsername) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));

        List<ParentChildLink> links = parentChildLinkRepository.findAllByParent(parent);
        return links.stream()
            .map(link -> ChildResponse.builder()
                    .childId(link.getChild().getId())
                    .username(link.getChild().getUsername())
                    .firstName(link.getChild().getFirstName())
                    .lastName(link.getChild().getLastName())
                    .age(link.getChild().getAge())
                    .grade(link.getChild().getGrade())
                    .school(link.getChild().getSchool())
                    .build())
            .collect(Collectors.toList());
    }

    public ChildResponse getChildProgress(String parentUsername, Long childId) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + childId));
        verifyParentChildLink(parent, child);

        StudentProfile childProfile = studentProfileRepository.findByUser(child)
                .orElseThrow(() -> new UserNotFoundException("Student profile not found for child: " + childId));

        // numerator: completed lessons per subject (from the child's progress)
        Map<Long, Long> doneBySubject = lessonProgressRepository.findAllByStudentProfile(childProfile).stream()
                .filter(lp -> lp.getStatus() == ProgressStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        lp -> lp.getLesson().getSubject().getId(),
                        Collectors.counting()));

        // denominator: all lessons per subject (from the catalog)
        List<SubjectProgressDto> subjectProgress = subjectRepository.findAll().stream()
                .map(s -> {
                    long total = lessonRepository.countBySubjectIdAndPublishedTrue(s.getId());
                    long done = doneBySubject.getOrDefault(s.getId(), 0L);
                    return SubjectProgressDto.builder()
                            .subjectName(s.getName())
                            .completed((int) done)
                            .total((int) total)
                            .progressPercent(total > 0 ? (int) Math.round(done * 100.0 / total) : 0)
                            .build();
                })
                .filter(dto -> dto.getTotal() > 0)
                .toList();

        return ChildResponse.builder()
                .childId(child.getId())
                .firstName(child.getFirstName())
                .lastName(child.getLastName())
                .username(child.getUsername())
                .subjectProgress(subjectProgress)
                .build();
    }

    public void sendMessage(String parentUsername, SendMessageRequest request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        encouragementMessageRepository.save(
            EncouragementMessage.builder()
                .parent(parent)
                .child(child)
                .message(request.getMessage())
                .build()
        );
    }

    public void setDailyGoal(String parentUsername, SetDailyGoalRequest request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        DailyGoal existingGoal = dailyGoalRepository.findByParentAndChild(parent, child).orElse(null);
        if (existingGoal != null){
            existingGoal.setGoal(request.getGoal());
            dailyGoalRepository.save(existingGoal);
        } else {
            dailyGoalRepository.save(
                DailyGoal.builder()
                    .parent(parent)
                    .child(child)
                    .goal(request.getGoal())
                    .build()
            );
        }
    }

    public void requestTeacherReview(String parentUsername, TeacherReviewRequestDto request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        teacherReviewRequestRepository.save(
            TeacherReviewRequest.builder()
                .parent(parent)
                .child(child)
                .status(TeacherReviewRequest.ReviewStatus.PENDING)
                .build()
        );
    }

    public List<QuizResultDto> getChildQuizResults(String parentUsername, Long childId, int limit){
        User parent = userRepository.findByUsername(parentUsername)
            .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + childId));
        verifyParentChildLink(parent, child);

        StudentProfile profile = studentProfileRepository.findByUser(child)
                .orElseThrow(() -> new UserNotFoundException("Student profile not found for child: " + childId));

        int size = Math.min(Math.max(limit, 1), 20);
        return quizAttemptRepository.findRecentWithQuiz(profile, PageRequest.of(0, size)).stream()
        .map(a -> {
                var lesson = a.getQuiz().getLesson();
                String subject = (lesson != null && lesson.getSubject() != null) ? lesson.getSubject().getName() : null;
                // QuizAttempt.score is stored as a percentage; derive the raw correct count from it.
                int percent = a.getScore();
                int correct = (int) Math.round(percent * a.getTotalItems() / 100.0);
                return new QuizResultDto(a.getQuiz().getTitle(), subject,
                        correct, a.getTotalItems(), percent, a.isPassed(), a.getAttemptedAt());
        }).toList();
    }

    @Transactional(readOnly = true)
    public ParentOverviewResponse getChildOverview(String parentUsername, Long childId) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + childId));
        verifyParentChildLink(parent, child);

        StudentProfile profile = studentProfileRepository.findByUser(child)
                .orElseThrow(() -> new UserNotFoundException("Student profile not found for child: " + childId));

        StudentStatsResponse stats = studentStatsService.computeStats(profile);
        LocalDate today = LocalDate.now();

        List<LessonProgress> completed = lessonProgressRepository.findAllWithLessonByStudentProfileId(profile.getId())
                .stream()
                .filter(p -> p.getStatus() == ProgressStatus.COMPLETED && p.getCompletedAt() != null)
                .toList();
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(profile.getId()).stream()
                .filter(a -> a.getAttemptedAt() != null && a.getQuiz() != null)
                .toList();

        List<LocalDateTime> completionTimes = completed.stream().map(LessonProgress::getCompletedAt).toList();

        LocalDate firstActivity = java.util.stream.Stream.concat(
                        completionTimes.stream(),
                        attempts.stream().map(QuizAttempt::getAttemptedAt))
                .map(LocalDateTime::toLocalDate)
                .min(Comparator.naturalOrder())
                .orElse(null);

        return new ParentOverviewResponse(
                stats.streak(),
                stats.longestStreak(),
                stats.todayCompleted(),
                stats.dailyGoal(),
                stats.dailyGoalSetByParent(),
                learningWeek(firstActivity, today),
                weeklyActivity(completionTimes, today),
                notifications(completed, attempts, stats.dailyGoal(), today));
    }

    private List<Notification> notifications(List<LessonProgress> completed, List<QuizAttempt> attempts,
                                              int dailyGoal, LocalDate today) {
        LocalDateTime since = today.minusDays(NOTIFICATION_DAYS - 1L).atStartOfDay();
        List<Notification> out = new ArrayList<>();

        for (QuizAttempt a : attempts) {
            if (a.getAttemptedAt().isBefore(since)) continue;
            String title = a.getQuiz().getTitle();
            if (a.isPassed()) {
                out.add(new Notification("QUIZ_PASSED", "Quiz passed!",
                        "Scored " + a.getScore() + "% on " + title, a.getAttemptedAt()));
            } else {
                out.add(new Notification("QUIZ_FAILED", "Quiz needs a retry",
                        "Scored " + a.getScore() + "% on " + title
                                + " (passing: " + a.getQuiz().getPassingScore() + "%)", a.getAttemptedAt()));
            }
        }

        for (LessonProgress p : completed) {
            if (p.getCompletedAt().isBefore(since)) continue;
            out.add(new Notification("LESSON_COMPLETED", "Lesson completed",
                    "Finished " + p.getLesson().getSubject().getName() + ": " + p.getLesson().getTitle(),
                    p.getCompletedAt()));
        }

        LocalDateTime goalAt = goalReachedAt(
                completed.stream().map(LessonProgress::getCompletedAt).toList(), dailyGoal, today);
        if (goalAt != null) {
            out.add(new Notification("GOAL_REACHED", "Daily goal reached 🎯",
                    "Completed " + dailyGoal + " lesson" + (dailyGoal == 1 ? "" : "s") + " today", goalAt));
        }

        for (var l : lessonRepository.findByPublishedTrue()) {
            if (l.getCreatedAt() == null || l.getCreatedAt().isBefore(since) || l.getSubject() == null) continue;
            out.add(new Notification("NEW_LESSON", "New lesson available",
                    l.getSubject().getName() + ": " + l.getTitle(), l.getCreatedAt()));
        }

        out.sort(Comparator.comparing(Notification::at).reversed());
        return out.size() > NOTIFICATION_LIMIT ? out.subList(0, NOTIFICATION_LIMIT) : out;
    }

    /** Lessons completed per day for Mon..Sun of the week containing {@code today}. */
    static List<DayActivity> weeklyActivity(List<LocalDateTime> completions, LocalDate today) {
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Map<LocalDate, Long> perDay = completions.stream()
                .filter(Objects::nonNull)
                .map(LocalDateTime::toLocalDate)
                .collect(Collectors.groupingBy(d -> d, Collectors.counting()));

        List<DayActivity> week = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            week.add(new DayActivity(
                    d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    d,
                    perDay.getOrDefault(d, 0L).intValue()));
        }
        return week;
    }

    /** Week 1 = the 7 days starting on the first activity. No activity yet → week 1. */
    static int learningWeek(LocalDate firstActivity, LocalDate today) {
        if (firstActivity == null || firstActivity.isAfter(today)) return 1;
        return (int) (ChronoUnit.DAYS.between(firstActivity, today) / 7) + 1;
    }

    /** Time of today's Nth completion (N = goal), or null if the goal wasn't reached today. */
    static LocalDateTime goalReachedAt(List<LocalDateTime> completions, int goal, LocalDate today) {
        if (goal <= 0) return null;
        List<LocalDateTime> todays = completions.stream()
                .filter(t -> t != null && t.toLocalDate().equals(today))
                .sorted()
                .toList();
        return todays.size() >= goal ? todays.get(goal - 1) : null;
    }

    private void verifyParentChildLink(User parent, User child) {
        boolean linkExist = parentChildLinkRepository.existsByParentAndChild(parent, child);
        if(!linkExist){
            throw new IllegalStateException("No link exists between parent and child");
        }
    }
}
