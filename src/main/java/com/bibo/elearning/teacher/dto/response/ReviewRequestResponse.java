package com.bibo.elearning.teacher.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import com.bibo.elearning.parent.entity.TeacherReviewRequest.ReviewStatus;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewRequestResponse {

    private Long id;
    private String parentUsername;
    private String childUsername;
    private String childFullName;
    private ReviewStatus status;
    private LocalDateTime requestedAt;
}