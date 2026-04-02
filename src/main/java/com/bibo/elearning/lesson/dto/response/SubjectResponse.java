package com.bibo.elearning.lesson.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
}
