package com.bibo.elearning.quiz.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.quiz.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonId(Long lessonId);
}

