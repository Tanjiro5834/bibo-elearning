package com.bibo.elearning.parent.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubjectProgressDto {

    private String subjectName;
    private Integer completed;
    private Integer total;
    private Integer progressPercent;
}