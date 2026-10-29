package com.bibo.elearning.game.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.exception.UserNotFoundException;
import com.bibo.elearning.game.entity.GamePermission;
import com.bibo.elearning.game.repository.GamePermissionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor 
public class GamePermissionService {
    public static final Set<String> GAME_KEYS = Set.of("word", "math", "logic", "eco", "memory");

    private final GamePermissionRepository repo;
    private final UserRepository userRepository;

    @Transactional
    public void setAccess(String teacherUsername, Long studentId, String gameKey, boolean allowed) {
        if (!GAME_KEYS.contains(gameKey)) throw new IllegalArgumentException("Unknown game: " + gameKey);

        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new UserNotFoundException(teacherUsername));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (student.getRole().getName() != RoleName.STUDENT)
            throw new IllegalArgumentException("User is not a student");

        GamePermission p = repo.findByStudentIdAndGameKey(studentId, gameKey)
                .orElseGet(() -> new GamePermission(studentId, gameKey));
        p.setAllowed(allowed);
        p.setGrantedBy(teacher.getId());
        repo.save(p);
    }

    public List<String> allowedGames(String studentUsername) {
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new UserNotFoundException(studentUsername));
        return repo.findByStudentIdAndAllowedTrue(student.getId())
                   .stream().map(GamePermission::getGameKey).toList();
    }

    public Map<Long, List<String>> allAllowed() {
        return repo.findByAllowedTrue().stream()
                .collect(Collectors.groupingBy(GamePermission::getStudentId,
                        Collectors.mapping(GamePermission::getGameKey, Collectors.toList())));
    }

    public void assertCanPlay(Long studentId, String gameKey) {
        if (!repo.existsByStudentIdAndGameKeyAndAllowedTrue(studentId, gameKey))
            throw new AccessDeniedException("This game is locked by your teacher");
    }
}
