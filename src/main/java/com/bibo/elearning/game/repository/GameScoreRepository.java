package com.bibo.elearning.game.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bibo.elearning.game.entity.GameScore;

public interface GameScoreRepository extends JpaRepository<GameScore, Long>{
    List<GameScore> findByStudentIdOrderByPlayedAtAsc(Long studentId);

    @Query("select distinct g.studentId, g.gameKey from GameScore g")
    List<Object[]> findPlayedGamesPerStudent();
}
