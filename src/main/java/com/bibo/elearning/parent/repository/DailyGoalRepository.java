package com.bibo.elearning.parent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.entity.DailyGoal;
import java.util.Optional;

@Repository
public interface DailyGoalRepository extends JpaRepository<DailyGoal, Long> {

    Optional<DailyGoal> findByParentAndChild(User parent, User child);
}