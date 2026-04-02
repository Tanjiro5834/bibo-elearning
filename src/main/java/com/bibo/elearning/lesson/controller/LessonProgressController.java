package com.bibo.elearning.lesson.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.bibo.elearning.lesson.dto.request.UpdateLessonProgressRequest;
import com.bibo.elearning.lesson.dto.response.LessonDetailResponse;
import com.bibo.elearning.lesson.dto.response.LessonProgressResponse;
import com.bibo.elearning.lesson.dto.response.StudentLessonDashboardResponse;
import com.bibo.elearning.lesson.service.LessonProgressService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/lessons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    @PostMapping("/{lessonId}/start")
    public ResponseEntity<LessonProgressResponse> startLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonProgressService.startLesson(lessonId));
    }

    @GetMapping("/{lessonId}/progress")
    public ResponseEntity<LessonProgressResponse> getMyLessonProgress(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonProgressService.getMyLessonProgress(lessonId));
    }

    @PatchMapping("/{lessonId}/progress")
    public ResponseEntity<LessonProgressResponse> updateMyLessonProgress(
            @PathVariable Long lessonId,
            @RequestBody UpdateLessonProgressRequest request
    ) {
        return ResponseEntity.ok(lessonProgressService.updateMyLessonProgress(lessonId, request));
    }

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<LessonProgressResponse> completeLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonProgressService.completeLesson(lessonId));
    }

    @GetMapping
    public ResponseEntity<List<LessonProgressResponse>> getAllMyLessonProgress() {
        return ResponseEntity.ok(lessonProgressService.getAllMyLessonProgress());
    }

    @GetMapping("/in-progress")
    public ResponseEntity<List<LessonProgressResponse>> getMyInProgressLessons() {
        return ResponseEntity.ok(lessonProgressService.getMyInProgressLessons());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<LessonProgressResponse>> getMyCompletedLessons() {
        return ResponseEntity.ok(lessonProgressService.getMyCompletedLessons());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentLessonDashboardResponse> getMyLessonDashboard() {
        return ResponseEntity.ok(lessonProgressService.getMyLessonDashboard());
    }

    @GetMapping("/{lessonId}/continue")
    public ResponseEntity<LessonDetailResponse> continueLesson(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonProgressService.continueLesson(lessonId));
    }
}