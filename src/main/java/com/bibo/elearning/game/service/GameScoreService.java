package com.bibo.elearning.game.service;

import org.springframework.stereotype.Service;

import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.exception.UserNotFoundException;
import com.bibo.elearning.game.entity.GameScore;
import com.bibo.elearning.game.repository.GameScoreRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class GameScoreService {
    static final int MAX_SCORE_PER_PLAY = 10_000;
    private final GameScoreRepository gameScoreRepository;
    private final GamePermissionService gamePermissionService;
    private final UserRepository userRepository;

    @Transactional 
    public void record(String studentUsername, String gameKey, int score){
        if(!GamePermissionService.GAME_KEYS.contains(gameKey)){
            throw new IllegalArgumentException("Unknown game: " + gameKey);
        }

        if(score < 0 || score > MAX_SCORE_PER_PLAY){
            throw new IllegalArgumentException("Invalid score");
        }

        User student = userRepository.findByUsername(studentUsername)
        .orElseThrow(() -> new UserNotFoundException(studentUsername));
        gamePermissionService.assertCanPlay(student.getId(), gameKey);

        gameScoreRepository.save(new GameScore(student.getId(), gameKey, score));
    }
}
