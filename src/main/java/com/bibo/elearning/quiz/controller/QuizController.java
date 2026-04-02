package com.bibo.elearning.quiz.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.dto.request.SubmitQuizRequest;
import com.bibo.elearning.quiz.dto.response.QuizResultResponse;
import com.bibo.elearning.quiz.entity.Quiz;
import com.bibo.elearning.quiz.service.QuizService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/create")
    public ResponseEntity<Quiz> createQuiz(@RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(@RequestBody SubmitQuizRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Quiz>> getByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getQuizzesByLesson(lessonId));
    }
}