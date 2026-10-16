package com.bibo.elearning.lesson.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findBySubjectId(Long subjectId);
    List<Lesson> findBySubjectIdAndPublishedTrue(Long subjectId);
    List<Lesson> findByPublishedTrue();
    Optional<Lesson> findByIdAndPublishedTrue(Long lessonId);
    boolean existsByTitleIgnoreCaseAndSubjectId(String title, Long subjectId);
    long countBySubjectId(Long subjectId);
    long countByPublishedTrue();
    long countBySubjectIdAndPublishedTrue(Long subjectId);

    interface SubjectLessonCount {
        Long getSubjectId();
        String getSubjectName();
        Long getLessonCount();
    }

    @Query("""
        SELECT s.id AS subjectId, s.name AS subjectName, COUNT(l) AS lessonCount
        FROM Lesson l JOIN l.subject s
        WHERE l.published = true AND s.active = true
        GROUP BY s.id, s.name
        ORDER BY s.name
        """)
    List<SubjectLessonCount> countPublishedBySubject();
}
