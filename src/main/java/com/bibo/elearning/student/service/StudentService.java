package com.bibo.elearning.student.service;

import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.bibo.elearning.auth.common.enums.RoleName;
import com.bibo.elearning.auth.security.custom.CustomUserDetails;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.student.dto.request.CreateStudentProfileRequest;
import com.bibo.elearning.student.dto.response.StudentProfileResponse;
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

    public List<StudentProfileResponse> getAllStudents() {
        return studentProfileRepository.findByUserRoleNameOrderByCreatedAtDesc(RoleName.STUDENT)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StudentProfileResponse getMyProfile() {
        User user = getCurrentUser();

        StudentProfile profile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Profile not found"));

        return mapToResponse(profile);
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        User user = profile.getUser();
        return StudentProfileResponse.builder()
                .id(profile.getId())
                .username(user != null ? user.getUsername() : "N/A")
                .email(user != null ? user.getEmail() : "N/A")
                .fullName(profile.getFullName())
                .age(profile.getAge())
                .learningLevel(profile.getLearningLevel() != null ? profile.getLearningLevel() : "BEGINNER")
                .avatarUrl(profile.getAvatarUrl())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
