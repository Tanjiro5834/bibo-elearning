package com.bibo.elearning.quiz.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.student.model.StudentProfile;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
    @Query("""
        SELECT qa FROM QuizAttempt qa
        JOIN FETCH qa.quiz q
        LEFT JOIN FETCH q.lesson l
        LEFT JOIN FETCH l.subject
        WHERE qa.student = :student
        ORDER BY qa.attemptedAt DESC
        """)
    List<QuizAttempt> findRecentWithQuiz(@Param("student") StudentProfile student, Pageable pageable);
}