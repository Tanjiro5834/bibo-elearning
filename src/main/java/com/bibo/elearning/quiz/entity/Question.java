package com.bibo.elearning.quiz.entity;

import java.util.List;
import jakarta.persistence.Id;  
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionText;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<Choice> choices;
}
