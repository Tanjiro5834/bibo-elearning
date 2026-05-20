package com.bibo.elearning.teacher.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestStatusUpdateDTO {
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "IN_REVIEW|DONE", message = "Status must be either IN_REVIEW or DONE")
    private String status;
}