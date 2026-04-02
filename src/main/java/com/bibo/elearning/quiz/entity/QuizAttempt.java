package com.bibo.elearning.quiz.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.bibo.elearning.student.model.StudentProfile;
import lombok.Data;

@Entity
@Data
public class QuizAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private int score;
    private int totalItems;
    private boolean passed;
    private LocalDateTime attemptedAt;
}