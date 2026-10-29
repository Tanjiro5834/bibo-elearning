package com.bibo.elearning.student.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bibo.elearning.game.service.GamePermissionService;
import com.bibo.elearning.student.dto.request.CreateStudentProfileRequest;
import com.bibo.elearning.student.dto.response.StudentProfileResponse;
import com.bibo.elearning.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final GamePermissionService gamePermissionService;

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

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<List<StudentProfileResponse>> getAllStudents(){
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/games")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<String>> myGames(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(gamePermissionService.allowedGames(userDetails.getUsername()));
    }
}
