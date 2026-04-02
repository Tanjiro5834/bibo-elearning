package com.bibo.elearning.lesson.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.lesson.dto.request.CreateSubjectRequest;
import com.bibo.elearning.lesson.dto.response.SubjectResponse;
import com.bibo.elearning.lesson.service.SubjectService;
import lombok.RequiredArgsConstructor;
import java.util.List;
@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {
    private final SubjectService subjectService;
    
    @PostMapping
    public ResponseEntity<SubjectResponse> createSubject(@RequestBody CreateSubjectRequest request) {
        SubjectResponse response = subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<SubjectResponse>> getAllActiveSubjects(){
        return ResponseEntity.ok(subjectService.getAllActiveSubjects());
    }

    @GetMapping("/{subjectId}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable Long subjectId) {
        SubjectResponse response = subjectService.getSubjectById(subjectId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectResponse> updateSubject(
        @PathVariable Long subjectId, 
        @RequestBody CreateSubjectRequest request) {
        SubjectResponse response = subjectService.updateSubject(subjectId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{subjectId}/deactivate")
    public ResponseEntity<Void> deactivateSubject(@PathVariable Long subjectId) {
        subjectService.deactivateSubject(subjectId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{subjectId}/activate")
    public ResponseEntity<Void> activateSubject(@PathVariable Long subjectId) {
        subjectService.activateSubject(subjectId);
        return ResponseEntity.noContent().build();
    }
}
