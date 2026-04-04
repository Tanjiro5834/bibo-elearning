package com.bibo.elearning.lesson.service;

import org.springframework.stereotype.Service;
import com.bibo.elearning.lesson.dto.request.CreateLessonSectionRequest;
import com.bibo.elearning.lesson.dto.response.LessonSectionResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonSectionRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
@Service
@RequiredArgsConstructor
public class LessonSectionService {
    private final LessonSectionRepository lessonSectionRepository;
    private final LessonRepository lessonRepository;

    public LessonSectionResponse createSection(Long lessonId, CreateLessonSectionRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        LessonSection section = LessonSection.builder()
            .lesson(lesson)
            .title(request.getTitle())
            .content(request.getContent())
            .contentOrder(request.getContentOrder())
            .contentType(request.getContentType())
            .build();

        LessonSection saved = lessonSectionRepository.save(section);

        return mapToResponse(saved);
    }

    public List<LessonSectionResponse> getSectionsByLessonId(Long lessonId){
        lessonRepository.findById(lessonId)
        .orElseThrow(() -> new RuntimeException("Lesson not found"));

        return lessonSectionRepository.findByLessonIdOrderByContentOrderAsc(lessonId)
        .stream().map(this::mapToResponse).toList();
    }

    private LessonSectionResponse mapToResponse(LessonSection saved) {
        return LessonSectionResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .content(saved.getContent())
                .contentOrder(saved.getContentOrder())
                .contentType(saved.getContentType())
                .build();
    }
}
