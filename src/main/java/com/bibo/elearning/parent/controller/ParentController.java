package com.bibo.elearning.parent.controller;

//import com.bibo.elearning.parent.dto.*;
import com.bibo.elearning.parent.dto.request.LinkChildRequest;
import com.bibo.elearning.parent.dto.request.SendMessageRequest;
import com.bibo.elearning.parent.dto.request.SetDailyGoalRequest;
import com.bibo.elearning.parent.dto.request.TeacherReviewRequestDto;
import com.bibo.elearning.parent.dto.response.ChildResponse;
import com.bibo.elearning.parent.service.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @PostMapping("/link-child")
    public ResponseEntity<?> linkChild(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid LinkChildRequest request) {
        parentService.linkChild(userDetails.getUsername(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Child linked successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/children")
    public ResponseEntity<?> getChildren(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ChildResponse> children = parentService.getChildren(userDetails.getUsername());
        return ResponseEntity.ok(children);
    }

    @GetMapping("/child/{childId}/progress")
    public ResponseEntity<?> getChildProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long childId) {
        ChildResponse progress = parentService.getChildProgress(userDetails.getUsername(), childId);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/message-child")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody @Valid SendMessageRequest request) {
        parentService.sendMessage(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Message sent successfully"));
    }

    @PostMapping("/set-daily-goal")
    public ResponseEntity<?> setDailyGoal(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody @Valid SetDailyGoalRequest request) {
        parentService.setDailyGoal(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Daily goal set successfully"));
    }

    @PostMapping("/request-teacher-review")
    public ResponseEntity<?> requestTeacherReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TeacherReviewRequestDto request) {
        parentService.requestTeacherReview(userDetails.getUsername(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Teacher review requested successfully");
        return ResponseEntity.ok(response);
    }
}