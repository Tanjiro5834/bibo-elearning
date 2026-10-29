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

import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import com.bibo.elearning.game.service.GameScoreService;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final GamePermissionService gamePermissionService;
    private final GameScoreService gameScoreService;

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

    @PostMapping("/games/{gameKey}/score")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> saveGameScore(@AuthenticationPrincipal UserDetails userDetails,
                                                             @PathVariable String gameKey,
                                                             @RequestBody Map<String, Integer> body) {
        int score = body.getOrDefault("score", 0);
        gameScoreService.record(userDetails.getUsername(), gameKey, score);
        return ResponseEntity.ok(Map.of("saved", true, "score", score));
    }
}
