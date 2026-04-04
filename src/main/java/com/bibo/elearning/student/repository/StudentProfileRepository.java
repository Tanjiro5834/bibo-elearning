package com.bibo.elearning.student.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.student.model.StudentProfile;
import java.util.List;
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    List<StudentProfile> findByUserRoleNameOrderByCreatedAtDesc(RoleName roleName);
}
