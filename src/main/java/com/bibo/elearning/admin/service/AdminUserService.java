package com.bibo.elearning.admin.service;

import com.bibo.elearning.admin.dto.request.CreateUserRequest;
import com.bibo.elearning.admin.dto.request.UpdateUserRequest;
import com.bibo.elearning.admin.dto.response.UserResponse;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.user.entity.Role;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.RoleRepository;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.parent.entity.ParentChildLink;
import com.bibo.elearning.parent.repository.ParentChildLinkRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ParentChildLinkRepository parentChildLinkRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists");

        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists");

        Role role = roleRepository.findByName(req.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found: " + req.getRole()));

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        if (req.getRole() == RoleName.PARENT && req.getChildren() != null && !req.getChildren().isEmpty()) {
            Role studentRole = roleRepository.findByName(RoleName.STUDENT)
                    .orElseThrow(() -> new RuntimeException("STUDENT role not found"));

            User parent = userRepository.save(user);

            for (CreateUserRequest.ChildRequest c : req.getChildren()) {
                if (userRepository.existsByUsername(c.getUsername()))
                    throw new RuntimeException("Child username already exists: " + c.getUsername());
                if (userRepository.existsByEmail(c.getEmail()))
                    throw new RuntimeException("Child email already exists: " + c.getEmail());

                User child = User.builder()
                        .firstName(c.getFirstName())
                        .lastName(c.getLastName())
                        .username(c.getUsername())
                        .email(c.getEmail())
                        .password(passwordEncoder.encode(c.getPassword()))
                        .role(studentRole)
                        .age(c.getAge())
                        .grade(c.getGrade())
                        .school(c.getSchool())
                        .parent(parent)
                        .enabled(true)
                        .build();

                User savedChild = userRepository.save(child);

                ParentChildLink link = new ParentChildLink();
                link.setParent(parent);
                link.setChild(savedChild);
                parentChildLinkRepository.save(link);
            }
            return new UserResponse(parent);
        }

        return new UserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());

        return new UserResponse(userRepository.save(user));
    }

    @Transactional
    public void setEnabled(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }
}