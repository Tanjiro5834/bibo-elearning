package com.bibo.elearning.parent.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.bibo.elearning.auth.user.entity.User;

@Entity
@Table(name = "encouragement_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EncouragementMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @PrePersist
    public void prePersist() {
        this.sentAt = LocalDateTime.now();
        this.isRead = false;
    }
}
