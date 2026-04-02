package com.bibo.elearning.lesson.entity;

import java.time.LocalDateTime;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.student.model.StudentProfile;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    @Column(nullable = false)
    @Builder.Default
    private Integer progressPercent = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentSectionOrder = 0;

    private LocalDateTime lastAccessedAt;

    private LocalDateTime completedAt;

    // ── helper methods ──────────────────────────────────────────

    public void markStarted() {
        if (this.status == ProgressStatus.NOT_STARTED) {
            this.status = ProgressStatus.IN_PROGRESS;
            this.lastAccessedAt = LocalDateTime.now();
        }
    }

    public void markCompleted() {
        this.status = ProgressStatus.COMPLETED;
        this.progressPercent = 100;
        this.completedAt = LocalDateTime.now();
        this.lastAccessedAt = LocalDateTime.now();
    }

    public void updateProgress(Integer sectionOrder, Integer totalSections) {
        this.currentSectionOrder = sectionOrder;
        this.lastAccessedAt = LocalDateTime.now();

        if (totalSections != null && totalSections > 0) {
            this.progressPercent = (int) Math.round((sectionOrder * 100.0) / totalSections);
        }

        if (this.status == ProgressStatus.NOT_STARTED) {
            this.status = ProgressStatus.IN_PROGRESS;
        }

        if (this.progressPercent >= 100) {
            markCompleted();
        }
    }
}