package com.bibo.elearning.admin.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.admin.dto.request.CreateUserRequest;
import com.bibo.elearning.admin.dto.request.UpdateUserRequest;
import com.bibo.elearning.admin.dto.response.UserResponse;
import com.bibo.elearning.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminUserService adminUserService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard() {
        return "Welcome Admin";
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminUserService.getAllUsers();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        try {
            return ResponseEntity.ok(adminUserService.createUser(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        try {
            return ResponseEntity.ok(adminUserService.updateUser(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        try {
            adminUserService.setEnabled(id, false);
            return ResponseEntity.ok(Map.of("message", "User deactivated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        try {
            adminUserService.setEnabled(id, true);
            return ResponseEntity.ok(Map.of("message", "User activated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}