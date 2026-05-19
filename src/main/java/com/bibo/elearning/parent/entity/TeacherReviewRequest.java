package com.bibo.elearning.parent.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.bibo.elearning.auth.user.entity.User;

@Entity
@Table(name = "teacher_review_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherReviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @PrePersist
    public void prePersist() {
        this.requestedAt = LocalDateTime.now();
        this.status = ReviewStatus.PENDING;
    }

    public enum ReviewStatus {
        PENDING, IN_REVIEW, DONE
    }
}
