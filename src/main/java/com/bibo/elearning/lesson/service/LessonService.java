package com.bibo.elearning.lesson.service;

import org.springframework.stereotype.Service;
import com.bibo.elearning.lesson.dto.request.CreateLessonRequest;
import com.bibo.elearning.lesson.dto.request.UpdateLessonRequest;
import com.bibo.elearning.lesson.dto.response.LessonDetailResponse;
import com.bibo.elearning.lesson.dto.response.LessonSummaryResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import com.bibo.elearning.lesson.entity.Subject;
import com.bibo.elearning.lesson.mapper.LessonMapper;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonSectionRepository;
import com.bibo.elearning.lesson.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final LessonSectionRepository lessonSectionRepository;
    private final SubjectRepository subjectRepository;
    private final LessonMapper lessonMapper;

   @Transactional
    public LessonDetailResponse createLesson(CreateLessonRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.getSubjectId()));

        Lesson lesson = Lesson.builder()
                .subject(subject)
                .title(request.getTitle())
                .description(request.getDescription())
                .estimatedMinutes(request.getEstimatedMinutes())
                .learningLevel(request.getLearningLevel())
                .published(false)
                .build();

        Lesson savedLesson = lessonRepository.save(lesson);

        if (request.getSections() != null && !request.getSections().isEmpty()) {
            List<LessonSection> sections = request.getSections().stream()
                    .map(sectionRequest -> LessonSection.builder()
                            .lesson(savedLesson)
                            .title(sectionRequest.getTitle())
                            .content(sectionRequest.getContent())
                            .contentOrder(sectionRequest.getContentOrder())
                            .contentType(sectionRequest.getContentType())
                            .build())
                    .toList();

            lessonSectionRepository.saveAll(sections);
        }

        List<LessonSection> savedSections =
                lessonSectionRepository.findByLessonOrderByContentOrderAsc(savedLesson);

        return lessonMapper.toDetailResponse(savedLesson, savedSections);
    }

    public List<LessonSummaryResponse> getAllPublishedLessons() {
        return lessonRepository.findByPublishedTrue()
                .stream().map(lesson -> LessonSummaryResponse.builder()
                        .id(lesson.getId())
                        .subjectId(lesson.getSubject().getId())
                        .subjectName(lesson.getSubject().getName())
                        .title(lesson.getTitle())
                        .description(lesson.getDescription())
                        .estimatedMinutes(lesson.getEstimatedMinutes())
                        .published(lesson.getPublished())
                        .build()).toList();
    }

    public List<LessonSummaryResponse> getLessonsBySubject(Long subjectId) {
        return lessonRepository.findBySubjectId(subjectId)
                .stream().map(lesson -> LessonSummaryResponse.builder()
                        .id(lesson.getId())
                        .subjectId(lesson.getSubject().getId())
                        .subjectName(lesson.getSubject().getName())
                        .title(lesson.getTitle())
                        .description(lesson.getDescription())
                        .estimatedMinutes(lesson.getEstimatedMinutes())
                        .published(lesson.getPublished())
                        .build()).toList();
    }

    public List<LessonSummaryResponse> getAllLessonsForAdmin() {
        return lessonRepository.findAll()
                .stream().map(lesson -> LessonSummaryResponse.builder()
                        .id(lesson.getId())
                        .subjectId(lesson.getSubject().getId())
                        .subjectName(lesson.getSubject().getName())
                        .title(lesson.getTitle())
                        .description(lesson.getDescription())
                        .estimatedMinutes(lesson.getEstimatedMinutes())
                        .published(lesson.getPublished())
                        .build()).toList();
    }

    public LessonDetailResponse getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        List<LessonSection> sections = lessonSectionRepository.findByLessonOrderByContentOrderAsc(lesson);
        return lessonMapper.toDetailResponse(lesson, sections);
    }

    public LessonDetailResponse getPublishedLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findByIdAndPublishedTrue(lessonId)
                .orElseThrow(() -> new RuntimeException("Published lesson not found with id: " + lessonId));
        List<LessonSection> sections = lessonSectionRepository.findByLessonOrderByContentOrderAsc(lesson);
        return lessonMapper.toDetailResponse(lesson, sections);
    }

    @Transactional
    public LessonDetailResponse updateLesson(Long lessonId, UpdateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setEstimatedMinutes(request.getEstimatedMinutes());
        lesson.setLearningLevel(request.getLearningLevel());
        lesson.setPublished(request.getPublished());
        Lesson updatedLesson = lessonRepository.save(lesson);

        List<LessonSection> sections = lessonSectionRepository.findByLessonOrderByContentOrderAsc(lesson);
        return lessonMapper.toDetailResponse(updatedLesson, sections);
    }

    public void publishLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        lesson.setPublished(true);
        lessonRepository.save(lesson);
    }

    public void unpublishLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        lesson.setPublished(false);
        lessonRepository.save(lesson);
    }

    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        lessonRepository.delete(lesson);
    }
}