package com.bibo.elearning.student.model;
import lombok.*;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.student.enums.GradeLevel;
import com.bibo.elearning.student.enums.LearningPathStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 50)
    private String learningLevel; // e.g. Beginner, Grade 3, etc.

    @Column(length = 100)
    private String fullName;

    @Column(length = 255)
    private String avatarUrl;
}