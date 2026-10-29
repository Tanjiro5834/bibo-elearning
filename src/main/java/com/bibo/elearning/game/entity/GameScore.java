package com.bibo.elearning.game.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity 
@Table(name = "game_scores")
@Getter @Setter @NoArgsConstructor 
public class GameScore {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "game_key", nullable = false, length = 50)
    private String gameKey;

    @Column(nullable = false)
    private int score;

    @Column(name = "played_at")
    private LocalDateTime playedAt;

    public GameScore(Long studentId, String gameKey, int score){
        this.studentId = studentId;
        this.gameKey = gameKey;
        this.score = score;
        this.playedAt = LocalDateTime.now();
    }
}
