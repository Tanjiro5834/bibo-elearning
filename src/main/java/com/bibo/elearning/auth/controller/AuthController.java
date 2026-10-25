package com.bibo.elearning.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.auth.dto.request.LoginRequest;
import com.bibo.elearning.auth.dto.response.AuthResponse;
import com.bibo.elearning.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Public auth endpoints. Login only — accounts are created by an ADMIN
 * through /api/admin/users, so there are no public register endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
