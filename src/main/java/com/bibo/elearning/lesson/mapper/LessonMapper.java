package com.bibo.elearning.lesson.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import com.bibo.elearning.lesson.dto.response.LessonDetailResponse;
import com.bibo.elearning.lesson.dto.response.LessonSectionResponse;
import com.bibo.elearning.lesson.dto.response.LessonSummaryResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;

@Component
public class LessonMapper {

    public LessonSummaryResponse toSummaryResponse(Lesson lesson) {
        return LessonSummaryResponse.builder()
                .id(lesson.getId())
                .subjectId(lesson.getSubject().getId())
                .subjectName(lesson.getSubject().getName())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .published(lesson.getPublished())
                .build();
    }

    public LessonDetailResponse toDetailResponse(Lesson lesson, List<LessonSection> sections) {
        return LessonDetailResponse.builder()
                .id(lesson.getId())
                .subjectId(lesson.getSubject().getId())
                .subjectName(lesson.getSubject().getName())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .learningLevel(lesson.getLearningLevel())
                .published(lesson.getPublished())
                .sections(toSectionResponseList(sections))
                .build();
    }

    public List<LessonSummaryResponse> toSummaryResponseList(List<Lesson> lessons) {
        return lessons.stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    public List<LessonSectionResponse> toSectionResponseList(List<LessonSection> sections) {
        return sections.stream()
                .map(this::toSectionResponse)
                .toList();
    }

    private LessonSectionResponse toSectionResponse(LessonSection section) {
        return LessonSectionResponse.builder()
                .id(section.getId())
                .title(section.getTitle())
                .content(section.getContent())
                .contentOrder(section.getContentOrder())
                .contentType(section.getContentType())
                .build();
    }
}