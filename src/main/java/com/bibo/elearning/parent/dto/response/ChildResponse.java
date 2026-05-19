package com.bibo.elearning.parent.dto.response;

import java.util.List;
import com.bibo.elearning.parent.dto.request.SubjectProgressDto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChildResponse {

    private Long childId;
    private String username;
    private String firstName;
    private String lastName;
    private Integer age;
    private String grade;
    private String school;
    private List<SubjectProgressDto> subjectProgress;
}