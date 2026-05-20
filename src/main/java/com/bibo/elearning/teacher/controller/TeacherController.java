package com.bibo.elearning.teacher.controller;

import com.bibo.elearning.teacher.dto.response.ReviewRequestResponse;
import com.bibo.elearning.teacher.dto.response.StudentSummaryResponse;
import com.bibo.elearning.teacher.dto.response.TeacherProfileResponse;
import com.bibo.elearning.teacher.service.TeacherService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

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

    @PatchMapping("/review-requests/{id}/status")
    public ResponseEntity<?> updateReviewStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam @NotBlank String status) {
        teacherService.updateReviewStatus(userDetails.getUsername(), id, status);
        return ResponseEntity.ok().build();
    }
}