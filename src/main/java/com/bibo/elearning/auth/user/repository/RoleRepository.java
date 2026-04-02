package com.bibo.elearning.auth.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.Role;
import java.util.Optional;
public interface RoleRepository extends JpaRepository<Role, Long> {
   Optional<Role> findByName(RoleName name);
}
