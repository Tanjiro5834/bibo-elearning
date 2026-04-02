package com.bibo.elearning.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CreateStudentProfileRequest {

    @NotBlank
    private String fullName;

    @NotNull
    private Integer age;

    @NotBlank
    private String learningLevel;
}