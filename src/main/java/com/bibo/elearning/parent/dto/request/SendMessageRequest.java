package com.bibo.elearning.parent.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SendMessageRequest {

    private Long childId;
    private String message;
}
