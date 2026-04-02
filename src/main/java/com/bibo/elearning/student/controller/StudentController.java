package com.bibo.elearning.student.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.student.dto.CreateStudentProfileRequest;
import com.bibo.elearning.student.dto.StudentProfileResponse;
import com.bibo.elearning.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponse> createProfile(
            @Valid @RequestBody CreateStudentProfileRequest request
    ) {
        return ResponseEntity.ok(studentService.createProfile(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponse> getMyProfile() {
        return ResponseEntity.ok(studentService.getMyProfile());
    }

    @GetMapping("/hash")
    public String hash() {
        return new BCryptPasswordEncoder().encode("secret123");
    }
}
