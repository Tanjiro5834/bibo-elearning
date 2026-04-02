package com.bibo.elearning.student.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudentProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Integer age;
    private String learningLevel;
    private String avatarUrl;
}