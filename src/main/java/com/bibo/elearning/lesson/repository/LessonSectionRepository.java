package com.bibo.elearning.lesson.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import java.util.List;
public interface LessonSectionRepository extends JpaRepository<LessonSection, Long> {
    List<LessonSection> findAllByLessonIdOrderByContentOrderAsc(Long lessonId);
    List<LessonSection> findByLessonOrderByContentOrderAsc(Lesson lesson);
    List<LessonSection> findByLessonIdOrderByContentOrderAsc(Long lessonId);
    Integer countByLessonId(Long lessonId);
}
