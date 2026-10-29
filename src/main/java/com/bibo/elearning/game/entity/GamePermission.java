package com.bibo.elearning.game.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_permissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "game_key"}))
@Getter @Setter @NoArgsConstructor
public class GamePermission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "game_key", nullable = false, length = 50)
    private String gameKey;

    private boolean allowed = false;

    @Column(name = "granted_by")
    private Long grantedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public GamePermission(Long studentId, String gameKey) {
        this.studentId = studentId;
        this.gameKey = gameKey;
    }
}