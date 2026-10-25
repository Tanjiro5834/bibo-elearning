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
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.auth.common.enums.ContentType;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.quiz.repository.QuizRepository;
import com.bibo.elearning.upload.ImageStorageService;
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
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ImageStorageService imageStorageService;

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
        
        if (request.getPublished() != null) {
            lesson.setPublished(request.getPublished());
        }

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

    /**
     * Deletes a lesson with its sections, quizzes and uploaded images.
     * If students already have progress or quiz attempts on it, the delete is refused
     * (409) unless {@code force} is set, which also removes that student history.
     */
    @Transactional
    public void deleteLesson(Long lessonId, boolean force) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found with id: " + lessonId));

        long progress = lessonProgressRepository.countByLessonId(lessonId);
        long attempts = quizAttemptRepository.countByQuizLessonId(lessonId);
        if ((progress > 0 || attempts > 0) && !force) {
            throw new IllegalStateException(String.format(
                    "\"%s\" already has student activity (%d progress record%s, %d quiz attempt%s). "
                            + "Unpublish it instead to keep students' history.",
                    lesson.getTitle(), progress, progress == 1 ? "" : "s", attempts, attempts == 1 ? "" : "s"));
        }

        List<String> images = lesson.getSections().stream()
                .filter(s -> s.getContentType() == ContentType.IMAGE)
                .map(LessonSection::getContent)
                .toList();

        quizAttemptRepository.deleteByQuizLessonId(lessonId);
        lessonProgressRepository.deleteByLessonId(lessonId);
        quizRepository.deleteAll(quizRepository.findByLessonId(lessonId)); // cascades questions + choices
        lessonRepository.delete(lesson);                                    // cascades sections
        lessonRepository.flush(); // surface FK errors before touching files

        images.forEach(imageStorageService::deleteIfStored);
    }
}