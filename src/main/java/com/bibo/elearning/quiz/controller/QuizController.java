package com.bibo.elearning.quiz.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.dto.request.SubmitQuizRequest;
import com.bibo.elearning.quiz.dto.response.QuizResponse;
import com.bibo.elearning.quiz.dto.response.QuizResultResponse;
import com.bibo.elearning.quiz.service.QuizService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizResultResponse> submitQuiz(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody SubmitQuizRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(userDetails.getUsername(), request));
    }

    @PostMapping("/create")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<QuizResponse>> getByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getQuizzesByLesson(lessonId));
    }
}