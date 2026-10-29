package com.bibo.elearning.teacher.controller;

import com.bibo.elearning.game.service.GamePermissionService;
import com.bibo.elearning.teacher.dto.response.ReviewRequestResponse;
import com.bibo.elearning.teacher.dto.response.StudentSummaryResponse;
import com.bibo.elearning.teacher.dto.response.TeacherProfileResponse;
import com.bibo.elearning.teacher.service.TeacherService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;
    private final GamePermissionService gamePermissionService;

    @GetMapping("/me")
    public ResponseEntity<TeacherProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        TeacherProfileResponse profile = teacherService.getTeacherData(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentSummaryResponse>> getStudents(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<StudentSummaryResponse> students = teacherService.getAllStudents(userDetails.getUsername());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/review-requests")
    public ResponseEntity<List<ReviewRequestResponse>> getReviewRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ReviewRequestResponse> requests = teacherService.getReviewRequests(userDetails.getUsername());
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/students/{studentId}/games/{gameKey}")
    public ResponseEntity<Void> setGameAccess(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long studentId, @PathVariable String gameKey,
                                            @RequestBody Map<String, Boolean> body) {
        gamePermissionService.setAccess(userDetails.getUsername(), studentId, gameKey,
                                        body.getOrDefault("allowed", false));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/review-requests/{id}/status")
    public ResponseEntity<?> updateReviewStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam @NotBlank String status) {
        teacherService.updateReviewStatus(userDetails.getUsername(), id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/games/permissions")
    public ResponseEntity<Map<Long, List<String>>> gamePermissions() {
        return ResponseEntity.ok(gamePermissionService.allAllowed());
    }
}