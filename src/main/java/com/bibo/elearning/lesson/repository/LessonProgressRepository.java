package com.bibo.elearning.lesson.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.student.model.StudentProfile;

import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByStudentProfileIdAndLessonId(Long studentProfileId, Long lessonId);

    List<LessonProgress> findByStudentProfileId(Long studentProfileId);

    List<LessonProgress> findByStudentProfileIdAndStatus(Long studentProfileId, ProgressStatus status);

    List<LessonProgress> findTop5ByStudentProfileIdOrderByLastAccessedAtDesc(Long studentProfileId);

    List<LessonProgress> findAllByStudentProfile(StudentProfile studentProfile);

    @Query("""
        SELECT lp FROM LessonProgress lp
        JOIN FETCH lp.lesson l
        JOIN FETCH l.subject
        WHERE lp.studentProfile.id = :studentProfileId
        """)
    List<LessonProgress> findAllWithLessonByStudentProfileId(@Param("studentProfileId") Long studentProfileId);

    @Query("""
        SELECT lp.studentProfile.id, COUNT(lp) FROM LessonProgress lp
        WHERE lp.status = :status
        GROUP BY lp.studentProfile.id
        """)
    List<Object[]> countPerStudentByStatus(@Param("status") ProgressStatus status);

    interface SubjectCompletedCount {
        Long getSubjectId();
        Long getCompleted();
    }

    interface StudentCompletedCount {
        Long getUserId();
        String getFirstName();
        String getLastName();
        String getUsername();
        Long getCompleted();
    }

    interface StudentActivity {
        Long getStudentId();
        LocalDateTime getOccurredAt();
    }

    @Query("""
        SELECT s.id AS subjectId, COUNT(lp) AS completed
        FROM LessonProgress lp
        JOIN lp.lesson l JOIN l.subject s
        JOIN lp.studentProfile sp JOIN sp.user u
        WHERE lp.status = :status AND l.published = true AND s.active = true AND u.enabled = true
        GROUP BY s.id
        """)
    List<SubjectCompletedCount> countCompletedBySubject(@Param("status") ProgressStatus status);

    @Query("""
        SELECT u.id AS userId, u.firstName AS firstName, u.lastName AS lastName,
            u.username AS username, COUNT(lp) AS completed
        FROM LessonProgress lp
        JOIN lp.lesson l JOIN l.subject s
        JOIN lp.studentProfile sp JOIN sp.user u
        WHERE lp.status = :status AND l.published = true AND s.active = true AND u.enabled = true
        GROUP BY u.id, u.firstName, u.lastName, u.username
        ORDER BY COUNT(lp) DESC, u.username ASC
        """)
    List<StudentCompletedCount> findTopByCompleted(@Param("status") ProgressStatus status, Pageable pageable);

    @Query("""
        SELECT lp.studentProfile.id AS studentId, lp.lastAccessedAt AS occurredAt
        FROM LessonProgress lp
        WHERE lp.lastAccessedAt >= :since
        """)
    List<StudentActivity> findActivitySince(@Param("since") LocalDateTime since);
}
