package com.bibo.elearning.teacher.mapper;

import org.springframework.stereotype.Component;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.entity.TeacherReviewRequest;
import com.bibo.elearning.teacher.dto.response.ReviewRequestResponse;
import com.bibo.elearning.teacher.dto.response.StudentSummaryResponse;
import com.bibo.elearning.teacher.dto.response.TeacherProfileResponse;

@Component
public class TeacherMapper {
    public TeacherProfileResponse mapToTeacherProfileResponse(User teacher) {
        return TeacherProfileResponse.builder()
                .id(teacher.getId())
                .username(teacher.getUsername())
                .email(teacher.getEmail())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .age(teacher.getAge())
                .school(teacher.getSchool())
                .build();
    }
    
    public StudentSummaryResponse mapToStudentSummaryResponse(User student) {
        return StudentSummaryResponse.builder()
                .id(student.getId())
                .username(student.getUsername())
                .email(student.getEmail())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .age(student.getAge())
                .grade(student.getGrade())
                .school(student.getSchool())
                .build();
    }

    public ReviewRequestResponse mapToReviewRequestResponse(TeacherReviewRequest request) {
        String firstName = request.getChild().getFirstName() != null ? request.getChild().getFirstName() : "";
        String lastName = request.getChild().getLastName() != null ? request.getChild().getLastName() : "";
        
        return ReviewRequestResponse.builder()
                .id(request.getId())
                .parentUsername(request.getParent().getUsername())
                .childUsername(request.getChild().getUsername())
                .childFullName((firstName + " " + lastName).trim())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .build();
    }
}
