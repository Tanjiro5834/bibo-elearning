package com.bibo.elearning.quiz.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.quiz.entity.QuizAttempt;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
}