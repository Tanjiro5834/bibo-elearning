package com.bibo.elearning.config;

import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.Role;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.RoleRepository;
import com.bibo.elearning.auth.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedAdmin() {
        return args -> {

            String email = "admin@bibo.com";

            if (userRepository.existsByEmail(email)) {
                System.out.println("✅ Admin already exists");
                return;
            }

            // 🔥 IMPORTANT: fetch ADMIN role from DB
            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User admin = User.builder()
                    .username("admin")
                    .email(email)
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .enabled(true)
                    .build();

            userRepository.save(admin);

            System.out.println("🔥 Admin created: admin@bibo.com / admin123");
        };
    }

    @Bean
    CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {

            if (roleRepository.findByName(RoleName.ADMIN).isEmpty()) {
                roleRepository.save(
                    Role.builder()
                        .name(RoleName.ADMIN)
                        .build()
                );
            }

            if (roleRepository.findByName(RoleName.STUDENT).isEmpty()) {
                roleRepository.save(
                    Role.builder()
                        .name(RoleName.STUDENT)
                        .build()
                );
            }

            if (roleRepository.findByName(RoleName.TEACHER).isEmpty()) {
               roleRepository.save(
                    Role.builder()
                        .name(RoleName.TEACHER)
                        .build()
                );
            }

            System.out.println("✅ Roles seeded");
        };
    }
}