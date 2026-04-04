package com.bibo.elearning.lesson.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.auth.security.custom.CustomUserDetails;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.lesson.dto.request.CreateSubjectRequest;
import com.bibo.elearning.lesson.dto.response.SubjectResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.lesson.entity.Subject;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.SubjectRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final StudentProfileRepository studentProfileRepository;

    public SubjectResponse createSubject(CreateSubjectRequest request) {
        if(subjectRepository.existsByNameIgnoreCase(request.getName())){
            throw new RuntimeException("Subject with name already exists: " + request.getName());
        }
        Subject subject = Subject.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();

        Subject savedSubject = subjectRepository.save(subject);
        return mapToResponse(savedSubject);
    }

    public List<SubjectResponse> getAllActiveSubjects() {
        StudentProfile student = getCurrentStudentProfile();

        return subjectRepository.findByActiveTrue()
                .stream()
                .map(subject -> mapToResponse(subject, student))
                .toList();
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll()
        .stream().map(this::mapToResponse).toList();
    }

    public SubjectResponse getSubjectById(Long id){
        StudentProfile student = getCurrentStudentProfile();

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));

        return mapToResponse(subject, student);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, CreateSubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());

        Subject saved = subjectRepository.save(subject);
        return mapToResponse(saved);
    }

    public void deactivateSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
            subject.setActive(false);
            subjectRepository.save(subject);
    }

    public void activateSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
            subject.setActive(true);
            subjectRepository.save(subject);
    }

    private SubjectResponse mapToResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .active(subject.isActive())
                .build();
    }

    private SubjectResponse mapToResponse(Subject subject, StudentProfile student){
        List<Lesson> lessons = lessonRepository.findBySubjectId(subject.getId());

        int lessonCount = lessons.size();
        int completedCount = 0, progressSum = 0;

        for(Lesson lesson : lessons){
            LessonProgress progress = lessonProgressRepository
            .findByStudentProfileIdAndLessonId(student.getId(), lesson.getId())
            .orElse(null);
            
            if(progress != null){
                progressSum += progress.getProgressPercent();

                if(progress.getStatus() == ProgressStatus.COMPLETED){
                    completedCount++;
                }
            }
        }

        int progress = lessonCount == 0 ? 0 : Math.round((float) progressSum / lessonCount);

        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .active(subject.isActive())
                .lessonCount(lessonCount)
                .completedCount(completedCount)
                .progress(progress)
                .build();
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
