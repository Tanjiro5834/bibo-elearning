package com.bibo.elearning.lesson.service;

import org.springframework.stereotype.Service;
import com.bibo.elearning.lesson.dto.request.CreateSubjectRequest;
import com.bibo.elearning.lesson.dto.response.SubjectResponse;
import com.bibo.elearning.lesson.entity.Subject;
import com.bibo.elearning.lesson.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;

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
         return subjectRepository.findByActiveTrue()
        .stream().map(this::mapToResponse).toList();
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll()
        .stream().map(this::mapToResponse).toList();
    }

    public SubjectResponse getSubjectById(Long id){
        SubjectResponse resp = subjectRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        return resp;
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, CreateSubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        return mapToResponse(subjectRepository.save(subject));
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
}
