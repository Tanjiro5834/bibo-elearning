package com.bibo.elearning.parent.service;

import org.springframework.stereotype.Service;
import com.bibo.elearning.auth.common.enums.ProgressStatus;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.lesson.entity.LessonProgress;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.exception.UserNotFoundException;
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.SubjectRepository;
import com.bibo.elearning.parent.dto.request.LinkChildRequest;
import com.bibo.elearning.parent.dto.request.SendMessageRequest;
import com.bibo.elearning.parent.dto.request.SetDailyGoalRequest;
import com.bibo.elearning.parent.dto.request.SubjectProgressDto;
import com.bibo.elearning.parent.dto.request.TeacherReviewRequestDto;
import com.bibo.elearning.parent.dto.response.ChildResponse;
import com.bibo.elearning.parent.entity.ParentChildLink;
import com.bibo.elearning.parent.repository.DailyGoalRepository;
import com.bibo.elearning.parent.repository.EncouragementMessageRepository;
import com.bibo.elearning.parent.repository.ParentChildLinkRepository;
import com.bibo.elearning.parent.repository.TeacherReviewRequestRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.bibo.elearning.parent.entity.DailyGoal;
import com.bibo.elearning.parent.entity.EncouragementMessage;
import com.bibo.elearning.parent.entity.TeacherReviewRequest;
@Service
@RequiredArgsConstructor
public class ParentService {
    private final ParentChildLinkRepository parentChildLinkRepository;
    private final EncouragementMessageRepository encouragementMessageRepository;
    private final TeacherReviewRequestRepository teacherReviewRequestRepository;
    private final DailyGoalRepository dailyGoalRepository;
    private final UserRepository userRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final StudentProfileRepository studentProfileRepository;

    public void linkChild(String parentUsername, LinkChildRequest request) {
        if (request == null || request.getChildUsername() == null || request.getChildUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Child username is required");
        }
        
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findByUsername(request.getChildUsername())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildUsername()));

        boolean alreadyLinked = parentChildLinkRepository.existsByParentAndChild(parent, child);
        if (alreadyLinked) {
            throw new IllegalStateException("Child is already linked to this parent");
        }

        ParentChildLink link = new ParentChildLink();
        link.setParent(parent);
        link.setChild(child);
        parentChildLinkRepository.save(link);
    }

    public List<ChildResponse> getChildren(String parentUsername) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));

        List<ParentChildLink> links = parentChildLinkRepository.findAllByParent(parent);
        return links.stream()
            .map(link -> ChildResponse.builder()
                    .childId(link.getChild().getId())
                    .username(link.getChild().getUsername())
                    .firstName(link.getChild().getFirstName())
                    .lastName(link.getChild().getLastName())
                    .age(link.getChild().getAge())
                    .grade(link.getChild().getGrade())
                    .school(link.getChild().getSchool())
                    .build())
            .collect(Collectors.toList());
    }

    public ChildResponse getChildProgress(String parentUsername, Long childId) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + childId));
        verifyParentChildLink(parent, child);

        StudentProfile childProfile = studentProfileRepository.findByUser(child)
            .orElseThrow(() -> new UserNotFoundException("Student profile not found for child: " + childId));

        List<LessonProgress> lessonProgressList = lessonProgressRepository.findAllByStudentProfile(childProfile);
        Map<String, long[]> subjectStats = new LinkedHashMap<>();
        for (LessonProgress lp : lessonProgressList) {
            String subjectName = lp.getLesson().getSubject().getName(); // adjust to your Subject field
            subjectStats.putIfAbsent(subjectName, new long[]{0, 0}); // [completed, total]
            subjectStats.get(subjectName)[1]++; // total++
            if (lp.getStatus() == ProgressStatus.COMPLETED) {
                subjectStats.get(subjectName)[0]++; // completed++
            }
        }

        List<SubjectProgressDto> subjectProgress = subjectStats.entrySet().stream()
                .map(entry -> SubjectProgressDto.builder()
                        .subjectName(entry.getKey())
                        .completed((int) entry.getValue()[0])
                        .total((int) entry.getValue()[1])
                        .progressPercent(entry.getValue()[1] > 0
                                ? (int) Math.round((entry.getValue()[0] * 100.0) / entry.getValue()[1])
                                : 0)
                        .build())
                .collect(Collectors.toList());


        return ChildResponse.builder()
            .childId(child.getId())
            .firstName(child.getFirstName())
            .lastName(child.getLastName())
            .username(child.getUsername())
            .subjectProgress(subjectProgress)
            .build();
    }

    public void sendMessage(String parentUsername, SendMessageRequest request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        encouragementMessageRepository.save(
            EncouragementMessage.builder()
                .parent(parent)
                .child(child)
                .message(request.getMessage())
                .build()
        );
    }

    public void setDailyGoal(String parentUsername, SetDailyGoalRequest request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        DailyGoal existingGoal = dailyGoalRepository.findByParentAndChild(parent, child).orElse(null);
        if (existingGoal != null){
            existingGoal.setGoal(request.getGoal());
            dailyGoalRepository.save(existingGoal);
        } else {
            dailyGoalRepository.save(
                DailyGoal.builder()
                    .parent(parent)
                    .child(child)
                    .goal(request.getGoal())
                    .build()
            );
        }
    }

    public void requestTeacherReview(String parentUsername, TeacherReviewRequestDto request) {
        User parent = userRepository.findByUsername(parentUsername)
                .orElseThrow(() -> new UserNotFoundException("Parent not found: " + parentUsername));
        User child = userRepository.findById(request.getChildId())
                .orElseThrow(() -> new UserNotFoundException("Child not found: " + request.getChildId()));
        verifyParentChildLink(parent, child);

        teacherReviewRequestRepository.save(
            TeacherReviewRequest.builder()
                .parent(parent)
                .child(child)
                .status(TeacherReviewRequest.ReviewStatus.PENDING)
                .build()
        );
    }

    private void verifyParentChildLink(User parent, User child) {
        boolean linkExist = parentChildLinkRepository.existsByParentAndChild(parent, child);
        if(!linkExist){
            throw new IllegalStateException("No link exists between parent and child");
        }
    }
}
