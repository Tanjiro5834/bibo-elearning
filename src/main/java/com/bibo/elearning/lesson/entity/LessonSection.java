package com.bibo.elearning.lesson.entity;

import jakarta.persistence.Id;
import com.bibo.elearning.auth.common.enums.ContentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lesson_sections")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Lesson lesson;

    @Column(length = 150)
    private String title;

    // 🧠 main content (text, html, markdown, etc.)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // 📌 order of the section (1,2,3,...)
    @Column(nullable = false)
    private Integer contentOrder;

    // 📦 type of content (TEXT, VIDEO, etc.)
    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private ContentType contentType;
}
