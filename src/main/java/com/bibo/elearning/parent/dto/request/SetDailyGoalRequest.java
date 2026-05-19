package com.bibo.elearning.parent.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SetDailyGoalRequest {

    private Long childId;
    private Integer goalCount;
    private Integer goal;
}