package com.bibo.elearning.parent.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LinkChildRequest {
    @NotBlank(message = "Child username is required")
    private String childUsername;
}
