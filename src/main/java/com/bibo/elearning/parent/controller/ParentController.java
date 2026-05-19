package com.bibo.elearning.parent.controller;

import com.bibo.elearning.parent.dto.*;
import com.bibo.elearning.parent.dto.request.LinkChildRequest;
import com.bibo.elearning.parent.dto.request.SendMessageRequest;
import com.bibo.elearning.parent.dto.request.SetDailyGoalRequest;
import com.bibo.elearning.parent.dto.request.TeacherReviewRequestDto;
import com.bibo.elearning.parent.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @PostMapping("/link-child")
    public ResponseEntity<?> linkChild(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody LinkChildRequest request) {
        // TODO: call parentService.linkChild()
        // TODO: return 200 OK with success message
        return ResponseEntity.ok().build();
    }

    @GetMapping("/children")
    public ResponseEntity<?> getChildren(
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: call parentService.getChildren()
        // TODO: return list of children
        return ResponseEntity.ok().build();
    }

    @GetMapping("/child/{childId}/progress")
    public ResponseEntity<?> getChildProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long childId) {
        // TODO: call parentService.getChildProgress()
        // TODO: return child progress data
        return ResponseEntity.ok().build();
    }

    @PostMapping("/message-child")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SendMessageRequest request) {
        // TODO: call parentService.sendMessage()
        // TODO: return 200 OK with success message
        return ResponseEntity.ok().build();
    }

    @PostMapping("/set-daily-goal")
    public ResponseEntity<?> setDailyGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SetDailyGoalRequest request) {
        // TODO: call parentService.setDailyGoal()
        // TODO: return 200 OK with success message
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request-teacher-review")
    public ResponseEntity<?> requestTeacherReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TeacherReviewRequestDto request) {
        // TODO: call parentService.requestTeacherReview()
        // TODO: return 200 OK with success message
        return ResponseEntity.ok().build();
    }
}