package com.bibo.elearning.lesson.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bibo.elearning.auth.common.enums.LessonStatus;
import com.bibo.elearning.auth.security.custom.CustomUserDetails;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.lesson.dto.request.UpdateLessonProgressRequest;
import com.bibo.elearning.lesson.dto.response.LessonDetailResponse;
import com.bibo.elearning.lesson.dto.response.LessonProgressResponse;
import com.bibo.elearning.lesson.dto.response.StudentLessonDashboardResponse;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.lesson.mapper.LessonProgressMapper;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonSectionRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final LessonSectionRepository lessonSectionRepository;
    private final LessonProgressMapper lessonProgressMapper;
    private final StudentProfileRepository studentProfileRepository;

    public LessonProgressResponse startLesson(Long lessonId) {
        StudentProfile student = getCurrentStudentProfile();

        var lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        LessonProgress progress = lessonProgressRepository
                .findByStudentProfileIdAndLessonId(student.getId(), lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = LessonProgress.builder()
                            .studentProfile(student)
                            .lesson(lesson)
                            .build();
                    newProgress.markStarted();
                    return lessonProgressRepository.save(newProgress);
                });

        return lessonProgressMapper.toResponse(progress);
    }

    public LessonProgressResponse getMyLessonProgress(Long lessonId) {
        StudentProfile student = getCurrentStudentProfile();

        LessonProgress progress = lessonProgressRepository
                .findByStudentProfileIdAndLessonId(student.getId(), lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson progress not found"));

        return lessonProgressMapper.toResponse(progress);
    }

    public LessonProgressResponse updateMyLessonProgress(Long lessonId, UpdateLessonProgressRequest request) {
        StudentProfile student = getCurrentStudentProfile();

        LessonProgress progress = lessonProgressRepository
                .findByStudentProfileIdAndLessonId(student.getId(), lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson progress not found"));

        int totalSections = lessonSectionRepository.countByLessonId(lessonId);
        progress.updateProgress(request.getCurrentSectionOrder(), totalSections);

        lessonProgressRepository.save(progress);

        return lessonProgressMapper.toResponse(progress);
    }

    public LessonProgressResponse completeLesson(Long lessonId) {
        StudentProfile student = getCurrentStudentProfile();

        LessonProgress progress = lessonProgressRepository
                .findByStudentProfileIdAndLessonId(student.getId(), lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson progress not found"));

        progress.markCompleted();

        return lessonProgressMapper.toResponse(lessonProgressRepository.save(progress));
    }

    public List<LessonProgressResponse> getAllMyLessonProgress() {
        StudentProfile student = getCurrentStudentProfile();

        return lessonProgressRepository.findByStudentProfileId(student.getId()).stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<LessonProgressResponse> getMyInProgressLessons() {
        StudentProfile student = getCurrentStudentProfile();

        return lessonProgressRepository
                .findByStudentProfileIdAndStatus(student.getId(), LessonStatus.IN_PROGRESS)
                .stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<LessonProgressResponse> getMyCompletedLessons() {
        StudentProfile student = getCurrentStudentProfile();

        return lessonProgressRepository
                .findByStudentProfileIdAndStatus(student.getId(), LessonStatus.COMPLETED)
                .stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
    }

    public StudentLessonDashboardResponse getMyLessonDashboard() {
        StudentProfile student = getCurrentStudentProfile();

        List<LessonProgress> allProgress = lessonProgressRepository.findByStudentProfileId(student.getId());

        List<LessonProgress> recentLessons = lessonProgressRepository
                .findTop5ByStudentProfileIdOrderByLastAccessedAtDesc(student.getId());

        return lessonProgressMapper.toDashboardResponse(allProgress, recentLessons);
    }

    public LessonDetailResponse continueLesson(Long lessonId) {
        return null;
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userDetails.getUser();
    }

    private StudentProfile getCurrentStudentProfile() {
        User user = getCurrentUser();

        return studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}