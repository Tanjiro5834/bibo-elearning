package com.bibo.elearning.quiz.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.bibo.elearning.quiz.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonId(Long lessonId);
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.lesson.id = :lessonId")
    List<Quiz> findByLessonIdWithQuestions(@Param("lessonId") Long lessonId);
}

