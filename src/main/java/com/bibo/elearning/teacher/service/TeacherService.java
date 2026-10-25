package com.bibo.elearning.teacher.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.parent.entity.TeacherReviewRequest;
import com.bibo.elearning.parent.repository.TeacherReviewRequestRepository;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import com.bibo.elearning.teacher.dto.response.ReviewRequestResponse;
import com.bibo.elearning.teacher.dto.response.StudentSummaryResponse;
import com.bibo.elearning.teacher.dto.response.TeacherProfileResponse;
import com.bibo.elearning.teacher.mapper.TeacherMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final UserRepository userRepository;
    private final TeacherReviewRequestRepository teacherReviewRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherMapper teacherMapper;
    private static final Set<String> VALID_STATUSES = Set.of("IN_REVIEW", "DONE");
    
    public TeacherProfileResponse getTeacherData(String username){
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Teacher not found with username: " + username));

        if(!isTeacher(teacher)){
            throw new IllegalStateException("User is not a teacher");
        }
        
        return teacherMapper.mapToTeacherProfileResponse(teacher);
    }

    public List<StudentSummaryResponse> getAllStudents(String teacherUsername){
        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new IllegalStateException("Teacher not found with username: " + teacherUsername));

        if(!isTeacher(teacher)){
            throw new IllegalStateException("User is not a teacher");
        }

        List<User> students = userRepository.findAllByRoleName("STUDENT");

        return students.stream()
        .map(u -> {
            StudentSummaryResponse dto = teacherMapper.mapToStudentSummaryResponse(u);
            studentProfileRepository.findByUserId(u.getId()).ifPresent(p -> {
                dto.setLearningLevel(p.getLearningLevel());
                dto.setJoinedAt(p.getCreatedAt());
            });
            return dto;
        })
        .collect(Collectors.toList());
    }

    public List<ReviewRequestResponse> getReviewRequests(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Teacher not found with username: " + username));

        if(!isTeacher(teacher)){
            throw new IllegalStateException("User is not a teacher");
        }

        // Requests aren't assigned to a specific teacher, so every teacher sees the shared queue.
        return getAllReviewRequests();
    }

    /** Shared review queue, newest first. Used by teachers and admins. */
    public List<ReviewRequestResponse> getAllReviewRequests() {
        return teacherReviewRequestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(teacherMapper::mapToReviewRequestResponse)
                .collect(Collectors.toList());
    }

    public void updateReviewStatus(String teacherUsername, Long requestId, String status) {
        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new IllegalStateException("Teacher not found with username: " + teacherUsername));

        if(!isTeacher(teacher)){
            throw new IllegalStateException("User is not a teacher");
        }

        setReviewStatus(requestId, status);
    }

    /** Status change without the teacher-role check (admin path; controller enforces ADMIN). */
    public void setReviewStatus(Long requestId, String status) {
        TeacherReviewRequest request = teacherReviewRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Review request not found with id: " + requestId));

        String upperStatus = status == null ? "" : status.trim().toUpperCase();
        if(!VALID_STATUSES.contains(upperStatus)){
            throw new IllegalArgumentException("Status must be either IN_REVIEW or DONE");
        }

        request.setStatus(TeacherReviewRequest.ReviewStatus.valueOf(upperStatus));
        teacherReviewRequestRepository.save(request);
    }

    private boolean isTeacher(User user) {
        if (user == null || user.getRole() == null || user.getRole().getName() == null) return false;
        String roleName = String.valueOf(user.getRole().getName()).toUpperCase();
        return roleName.equalsIgnoreCase("TEACHER");
    }
}
