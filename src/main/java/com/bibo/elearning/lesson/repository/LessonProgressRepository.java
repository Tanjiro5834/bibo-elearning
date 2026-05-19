package com.bibo.elearning.lesson.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bibo.elearning.auth.common.enums.LessonStatus;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.student.model.StudentProfile;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByStudentProfileIdAndLessonId(Long studentProfileId, Long lessonId);

    List<LessonProgress> findByStudentProfileId(Long studentProfileId);

    List<LessonProgress> findByStudentProfileIdAndStatus(Long studentProfileId, ProgressStatus status);

    List<LessonProgress> findTop5ByStudentProfileIdOrderByLastAccessedAtDesc(Long studentProfileId);

    List<LessonProgress> findAllByStudentProfile(StudentProfile studentProfile);
}
