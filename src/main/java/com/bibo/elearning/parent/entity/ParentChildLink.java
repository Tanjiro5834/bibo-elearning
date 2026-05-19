package com.bibo.elearning.parent.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.bibo.elearning.auth.user.entity.User;

@Entity
@Table(name = "parent_child_links")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentChildLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    @PrePersist
    public void prePersist() {
        this.linkedAt = LocalDateTime.now();
    }
}