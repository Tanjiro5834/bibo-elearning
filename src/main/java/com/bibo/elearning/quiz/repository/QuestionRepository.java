package com.bibo.elearning.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bibo.elearning.quiz.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {}