package com.bibo.elearning.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bibo.elearning.game.entity.GamePermission;
import java.util.Optional;
import java.util.List;

public interface GamePermissionRepository extends JpaRepository<GamePermission, Long>{
    Optional<GamePermission> findByStudentIdAndGameKey(Long studentId, String gameKey);
    List<GamePermission> findByStudentIdAndAllowedTrue(Long studentId);
    boolean existsByStudentIdAndGameKeyAndAllowedTrue(Long studentId, String gameKey);

    List<GamePermission> findByAllowedTrue();
}
