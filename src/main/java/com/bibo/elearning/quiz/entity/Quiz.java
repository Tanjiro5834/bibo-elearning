package com.bibo.elearning.quiz.entity;

import java.util.List;
import jakarta.persistence.*;
import com.bibo.elearning.lesson.entity.Lesson;
import lombok.Data;

@Entity
@Data
public class Quiz {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private int passingScore;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;
}