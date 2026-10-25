package com.bibo.elearning.quiz.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.student.model.StudentProfile;
import java.time.LocalDateTime;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);

    long countByQuizLessonId(Long lessonId);

    long countByQuizId(Long quizId);

    void deleteByQuizId(Long quizId);

    void deleteByQuizLessonId(Long lessonId);
    @Query("""
        SELECT qa FROM QuizAttempt qa
        JOIN FETCH qa.quiz q
        LEFT JOIN FETCH q.lesson l
        LEFT JOIN FETCH l.subject
        WHERE qa.student = :student
        ORDER BY qa.attemptedAt DESC
        """)
    List<QuizAttempt> findRecentWithQuiz(@Param("student") StudentProfile student, Pageable pageable);

    @Query("""
        SELECT qa.student.id, qa.quiz.id, MAX(qa.score),
            MAX(CASE WHEN qa.passed = true THEN 1 ELSE 0 END)
        FROM QuizAttempt qa
        WHERE qa.student IS NOT NULL
        GROUP BY qa.student.id, qa.quiz.id
        """)
    List<Object[]> findBestAttemptPerStudentAndQuiz();

    interface StudentActivity {
        Long getStudentId();
        LocalDateTime getOccurredAt();
    }

    @Query("""
        SELECT qa.student.id AS studentId, qa.attemptedAt AS occurredAt
        FROM QuizAttempt qa
        WHERE qa.attemptedAt >= :since
        """)
    List<StudentActivity> findActivitySince(@Param("since") LocalDateTime since);
}