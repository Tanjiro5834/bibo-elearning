package com.bibo.elearning.student.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.bibo.elearning.auth.security.custom.CustomUserDetails;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.student.dto.CreateStudentProfileRequest;
import com.bibo.elearning.student.dto.StudentProfileResponse;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentProfileRepository studentProfileRepository;

    public StudentProfileResponse createProfile(CreateStudentProfileRequest request){
        User user = getCurrentUser();
        if(studentProfileRepository.findByUser(user).isPresent()){
            throw new IllegalStateException("Profile already exists");
        }

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .age(request.getAge())
                .learningLevel(request.getLearningLevel())
                .build();

        studentProfileRepository.save(profile);

        return mapToResponse(profile);
    }

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getUser();
    }

    public StudentProfileResponse getMyProfile() {
        User user = getCurrentUser();

        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Profile not found"));

        return mapToResponse(profile);
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .username(profile.getUser().getUsername())
                .email(profile.getUser().getEmail())
                .fullName(profile.getFullName())
                .age(profile.getAge())
                .learningLevel(profile.getLearningLevel())
                .avatarUrl(profile.getAvatarUrl())
                .build();
    }
}
