package com.bibo.elearning.lesson.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.lesson.dto.request.CreateLessonSectionRequest;
import com.bibo.elearning.lesson.dto.response.LessonSectionResponse;
import com.bibo.elearning.lesson.service.LessonSectionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/lesson-sections")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonSectionController {
    private final LessonSectionService lessonSectionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LessonSectionResponse> createSection(@RequestBody CreateLessonSectionRequest request) {
        return ResponseEntity.ok(lessonSectionService.createSection(request.getLessonId(), request));
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT','PARENT','TEACHER')")
    public ResponseEntity<List<LessonSectionResponse>> getSectionsByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(lessonSectionService.getSectionsByLessonId(lessonId));
    }
}
