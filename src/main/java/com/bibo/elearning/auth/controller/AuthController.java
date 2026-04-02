package com.bibo.elearning.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.dto.request.LoginRequest;
import com.bibo.elearning.auth.dto.request.RegisterRequest;
import com.bibo.elearning.auth.dto.request.StudentRegisterRequest;
import com.bibo.elearning.auth.dto.response.AuthResponse;
import com.bibo.elearning.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    @PostMapping("/register/parent")
    public ResponseEntity<AuthResponse> registerParent(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request, RoleName.PARENT));
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<AuthResponse> registerTeacher(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request, RoleName.TEACHER));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request, RoleName.ADMIN));
    }
}