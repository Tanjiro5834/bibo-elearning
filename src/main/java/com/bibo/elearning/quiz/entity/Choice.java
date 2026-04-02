package com.bibo.elearning.quiz.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "choices")
public class Choice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String choiceText;

    private boolean isCorrect;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;
}