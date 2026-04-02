package com.bibo.elearning.auth.service;

import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.dto.request.LoginRequest;
import com.bibo.elearning.auth.dto.request.RegisterRequest;
import com.bibo.elearning.auth.dto.request.StudentRegisterRequest;
import com.bibo.elearning.auth.dto.response.AuthResponse;
import com.bibo.elearning.auth.security.custom.CustomUserDetails;
import com.bibo.elearning.auth.user.entity.Role;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.RoleRepository;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ========================
    // LOGIN
    // ========================
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String role = user.getRole().getName().name();
        String token = jwtService.generateToken(new CustomUserDetails(user), role);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(role)
                .build();
    }

    // ========================
    // SHARED USER CREATION
    // ========================
    private User createUser(RegisterRequest request, RoleName roleName) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String role = user.getRole().getName().name();

        String token = jwtService.generateToken(
                new CustomUserDetails(user),
                role
        );

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(role)
                .build();
    }

    // ========================
    // STUDENT REGISTRATION
    // ========================
    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        User savedUser = createUser(request, RoleName.STUDENT);

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .age(request.getAge())
                .learningLevel(request.getLearningLevel())
                .avatarUrl(request.getAvatarUrl())
                .build();

        studentProfileRepository.save(profile);

        return buildAuthResponse(savedUser);
    }

    // ========================
    // GENERIC REGISTRATION (PARENT / TEACHER)
    // ========================
    @Transactional
    public AuthResponse register(RegisterRequest request, RoleName roleName) {
        User savedUser = createUser(request, roleName);

        // Future extension:
        // if (roleName == RoleName.TEACHER) createTeacherProfile(...)
        // if (roleName == RoleName.PARENT) createParentProfile(...)

        return buildAuthResponse(savedUser);
    }
}