package com.bibo.elearning.admin.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.admin.dto.request.ChangePasswordRequest;
import com.bibo.elearning.admin.dto.request.CreateUserRequest;
import com.bibo.elearning.admin.dto.request.UpdateUserRequest;
import com.bibo.elearning.admin.dto.response.UserResponse;
import com.bibo.elearning.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;

import com.bibo.elearning.admin.dto.response.AnalyticsResponse;
import com.bibo.elearning.admin.service.AdminAnalyticsService;
import com.bibo.elearning.admin.service.AdminReportService;
import com.bibo.elearning.teacher.dto.response.ReviewRequestResponse;
import com.bibo.elearning.teacher.service.TeacherService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") 
public class AdminController {
    private final AdminUserService adminUserService;
    private final AdminAnalyticsService adminAnalyticsService;
    private final AdminReportService adminReportService;
    private final TeacherService teacherService;

    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "Welcome Admin";
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics() {
        return adminAnalyticsService.getAnalytics();
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

    // ── Account ──

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest req) {
        adminUserService.changePassword(userDetails.getUsername(), req.currentPassword(), req.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    // ── Teacher review requests (shared queue) ──

    @GetMapping("/review-requests")
    public List<ReviewRequestResponse> getReviewRequests() {
        return teacherService.getAllReviewRequests();
    }

    @PatchMapping("/review-requests/{id}/status")
    public ResponseEntity<Map<String, String>> updateReviewStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        teacherService.setReviewStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    // ── Reports (CSV) ──

    @GetMapping("/reports/{type}")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type) {
        String csv = adminReportService.buildCsv(type);
        // BOM so Excel opens UTF-8 (ñ, é in names) correctly
        byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] data = csv.getBytes(StandardCharsets.UTF_8);
        byte[] out = new byte[bom.length + data.length];
        System.arraycopy(bom, 0, out, 0, bom.length);
        System.arraycopy(data, 0, out, bom.length, data.length);

        String filename = "bibo-" + type + "-report-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(out);
    }
}
