package com.bibo.elearning.lesson.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import java.util.List;
import java.util.Optional;
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySubjectId(Long subjectId);
    List<Lesson> findBySubjectIdAndPublishedTrue(Long subjectId);
    List<Lesson> findByPublishedTrue();
    Optional<Lesson> findByIdAndPublishedTrue(Long lessonId);
    boolean existsByTitleIgnoreCaseAndSubjectId(String title, Long subjectId);
}
