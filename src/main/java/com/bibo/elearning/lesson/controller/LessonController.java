package com.bibo.elearning.lesson.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.bibo.elearning.lesson.dto.request.CreateLessonRequest;
import com.bibo.elearning.lesson.dto.request.UpdateLessonRequest;
import com.bibo.elearning.lesson.dto.response.LessonDetailResponse;
import com.bibo.elearning.lesson.dto.response.LessonSummaryResponse;
import com.bibo.elearning.lesson.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDetailResponse> createLesson(
            @Valid @RequestBody CreateLessonRequest request
    ) {
        return ResponseEntity.ok(lessonService.createLesson(request));
    }

    @GetMapping
    public ResponseEntity<List<LessonSummaryResponse>> getAllPublishedLessons() {
        return ResponseEntity.ok(lessonService.getAllPublishedLessons());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LessonSummaryResponse>> getAllLessonsForAdmin() {
        return ResponseEntity.ok(lessonService.getAllLessonsForAdmin());
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<LessonSummaryResponse>> getLessonsBySubject(
            @PathVariable Long subjectId
    ) {
        return ResponseEntity.ok(lessonService.getLessonsBySubject(subjectId));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getPublishedLessonById(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonService.getPublishedLessonById(lessonId));
    }

    @GetMapping("/admin/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDetailResponse> getLessonById(
            @PathVariable Long lessonId
    ) {
        return ResponseEntity.ok(lessonService.getLessonById(lessonId));
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonDetailResponse> updateLesson(
            @PathVariable Long lessonId,
            @RequestBody UpdateLessonRequest request
    ) {
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, request));
    }

    @PatchMapping("/{lessonId}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> publishLesson(@PathVariable Long lessonId) {
        lessonService.publishLesson(lessonId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{lessonId}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unpublishLesson(@PathVariable Long lessonId) {
        lessonService.unpublishLesson(lessonId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }
}