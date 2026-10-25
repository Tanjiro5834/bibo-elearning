package com.bibo.elearning.admin.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.student.model.StudentProfile;
import lombok.RequiredArgsConstructor;

/** Builds the CSV exports behind the admin Reports page. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    public static final List<String> TYPES = List.of("users", "content", "progress", "quizzes");
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public String buildCsv(String type) {
        Map<String, Function<AdminReportService, String>> builders = Map.of(
                "users", AdminReportService::users,
                "content", AdminReportService::content,
                "progress", AdminReportService::progress,
                "quizzes", AdminReportService::quizzes);
        Function<AdminReportService, String> builder = builders.get(type);
        if (builder == null) {
            throw new IllegalArgumentException("Unknown report type: " + type + ". Use one of " + TYPES);
        }
        return builder.apply(this);
    }

    String users() {
        StringBuilder sb = row(new StringBuilder(),
                "ID", "Username", "Email", "Role", "First Name", "Last Name", "Grade", "School", "Status");
        userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .forEach(u -> row(sb,
                        u.getId(), u.getUsername(), u.getEmail(),
                        u.getRole() == null ? "" : u.getRole().getName(),
                        u.getFirstName(), u.getLastName(), u.getGrade(), u.getSchool(),
                        u.isEnabled() ? "Active" : "Inactive"));
        return sb.toString();
    }

    String content() {
        StringBuilder sb = row(new StringBuilder(),
                "Subject", "Subject Active", "Lesson ID", "Lesson Title", "Published", "Est. Minutes", "Sections");
        lessonRepository.findAll().stream()
                .sorted(Comparator.comparing((Lesson l) -> l.getSubject() == null ? "" : l.getSubject().getName())
                        .thenComparing(Lesson::getId))
                .forEach(l -> row(sb,
                        l.getSubject() == null ? "" : l.getSubject().getName(),
                        l.getSubject() != null && l.getSubject().isActive() ? "Yes" : "No",
                        l.getId(), l.getTitle(),
                        Boolean.TRUE.equals(l.getPublished()) ? "Yes" : "No",
                        l.getEstimatedMinutes(),
                        l.getSections() == null ? 0 : l.getSections().size()));
        return sb.toString();
    }

    String progress() {
        StringBuilder sb = row(new StringBuilder(),
                "Student", "Username", "Subject", "Lesson", "Status", "Progress %", "Last Accessed", "Completed At");
        lessonProgressRepository.findAll().stream()
                .sorted(Comparator.comparing((LessonProgress p) -> studentUsername(p.getStudentProfile()))
                        .thenComparing(p -> p.getLesson().getId()))
                .forEach(p -> row(sb,
                        studentName(p.getStudentProfile()), studentUsername(p.getStudentProfile()),
                        p.getLesson().getSubject() == null ? "" : p.getLesson().getSubject().getName(),
                        p.getLesson().getTitle(), p.getStatus(), p.getProgressPercent(),
                        ts(p.getLastAccessedAt()), ts(p.getCompletedAt())));
        return sb.toString();
    }

    String quizzes() {
        StringBuilder sb = row(new StringBuilder(),
                "Student", "Username", "Quiz", "Subject", "Score %", "Items", "Passed", "Attempted At");
        quizAttemptRepository.findAll().stream()
                .filter(a -> a.getQuiz() != null)
                .sorted(Comparator.comparing(QuizAttempt::getAttemptedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(a -> {
                    Lesson lesson = a.getQuiz().getLesson();
                    row(sb,
                            studentName(a.getStudent()), studentUsername(a.getStudent()),
                            a.getQuiz().getTitle(),
                            lesson == null || lesson.getSubject() == null ? "" : lesson.getSubject().getName(),
                            a.getScore(), a.getTotalItems(), a.isPassed() ? "Yes" : "No",
                            ts(a.getAttemptedAt()));
                });
        return sb.toString();
    }

    // ── helpers ──

    private static String studentUsername(StudentProfile p) {
        return p == null || p.getUser() == null ? "" : p.getUser().getUsername();
    }

    private static String studentName(StudentProfile p) {
        if (p == null) return "";
        if (p.getFullName() != null && !p.getFullName().isBlank()) return p.getFullName();
        User u = p.getUser();
        if (u == null) return "";
        return ((u.getFirstName() == null ? "" : u.getFirstName()) + " "
                + (u.getLastName() == null ? "" : u.getLastName())).trim();
    }

    private static String ts(LocalDateTime t) {
        return t == null ? "" : t.format(TS);
    }

    private static StringBuilder row(StringBuilder sb, Object... cells) {
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(cell(cells[i]));
        }
        return sb.append("\r\n");
    }

    /** RFC 4180 quoting + neutralises spreadsheet formula injection (=, +, -, @). */
    static String cell(Object value) {
        if (value == null) return "";
        String s = String.valueOf(value);
        if (!s.isEmpty() && "=+-@".indexOf(s.charAt(0)) >= 0 && !(value instanceof Number)) {
            s = "'" + s;
        }
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
