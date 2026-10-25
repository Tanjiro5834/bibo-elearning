package com.bibo.elearning.lesson.service;

import org.springframework.stereotype.Service;
import com.bibo.elearning.lesson.dto.request.CreateLessonSectionRequest;
import com.bibo.elearning.lesson.dto.response.LessonSectionResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonSectionRepository;
import java.util.HashSet;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import com.bibo.elearning.auth.common.enums.ContentType;
import com.bibo.elearning.upload.ImageStorageService;
import lombok.RequiredArgsConstructor;
import java.util.List;
@Service
@RequiredArgsConstructor
public class LessonSectionService {
    private final LessonSectionRepository lessonSectionRepository;
    private final LessonRepository lessonRepository;
    private final ImageStorageService imageStorageService;

    public LessonSectionResponse createSection(Long lessonId, CreateLessonSectionRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (request.getContentType() == ContentType.VIDEO
                && (request.getContent() == null || !request.getContent().trim().matches("(?i)https?://\\S+"))) {
            throw new IllegalArgumentException("Video sections need a valid video link (http/https)");
        }

        // No order given → append after the current last section
        Integer order = request.getContentOrder();
        if (order == null || order < 1) {
            order = lessonSectionRepository.findByLessonIdOrderByContentOrderAsc(lessonId).stream()
                    .map(LessonSection::getContentOrder)
                    .filter(java.util.Objects::nonNull)
                    .max(Integer::compare)
                    .orElse(0) + 1;
        }

        LessonSection section = LessonSection.builder()
            .lesson(lesson)
            .title(request.getTitle())
            .content(request.getContent())
            .contentOrder(order)
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

    /**
     * Applies a new order: {@code sectionIds} must list every section of the lesson exactly once.
     * Orders are rewritten as 1..n so they stay contiguous.
     */
    @Transactional
    public List<LessonSectionResponse> reorderSections(Long lessonId, List<Long> sectionIds) {
        lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
        List<LessonSection> sections = lessonSectionRepository.findByLessonIdOrderByContentOrderAsc(lessonId);

        if (sectionIds == null
                || sectionIds.size() != sections.size()
                || new HashSet<>(sectionIds).size() != sectionIds.size()
                || !sections.stream().map(LessonSection::getId).collect(Collectors.toSet())
                        .equals(new HashSet<>(sectionIds))) {
            throw new IllegalArgumentException(
                    "The section list is out of date. Refresh the page and try again.");
        }

        Map<Long, LessonSection> byId = sections.stream()
                .collect(Collectors.toMap(LessonSection::getId, Function.identity()));
        for (int i = 0; i < sectionIds.size(); i++) {
            byId.get(sectionIds.get(i)).setContentOrder(i + 1);
        }
        lessonSectionRepository.saveAll(sections);

        return lessonSectionRepository.findByLessonIdOrderByContentOrderAsc(lessonId)
                .stream().map(this::mapToResponse).toList();
    }

    /** Deletes one section, renumbers the rest 1..n, and removes its uploaded image. */
    @Transactional
    public void deleteSection(Long sectionId) {
        LessonSection section = lessonSectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));
        Long lessonId = section.getLesson().getId();
        String imageUrl = section.getContentType() == ContentType.IMAGE ? section.getContent() : null;

        section.getLesson().getSections().remove(section); // keep the lesson's collection in sync
        lessonSectionRepository.delete(section);
        lessonSectionRepository.flush();

        List<LessonSection> rest = lessonSectionRepository.findByLessonIdOrderByContentOrderAsc(lessonId);
        for (int i = 0; i < rest.size(); i++) {
            rest.get(i).setContentOrder(i + 1);
        }
        lessonSectionRepository.saveAll(rest);

        imageStorageService.deleteIfStored(imageUrl);
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
