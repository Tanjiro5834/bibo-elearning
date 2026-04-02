package com.bibo.elearning.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequest extends RegisterRequest {

    @NotBlank
    private String fullName;

    @NotNull
    private Integer age;

    @NotBlank
    private String learningLevel;

    private String avatarUrl;
}