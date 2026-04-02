package com.bibo.elearning.lesson.mapper;

import java.util.List;
import java.util.stream.Collectors;
import com.bibo.elearning.lesson.dto.response.SubjectResponse;
import com.bibo.elearning.lesson.entity.Subject;

public class SubjectMapper {
    public SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .active(subject.isActive())
                .build();
    }

    public List<SubjectResponse> toResponseList(List<Subject> subjects) {
        return subjects.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
