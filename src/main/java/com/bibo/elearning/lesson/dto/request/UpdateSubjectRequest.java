package com.bibo.elearning.lesson.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class UpdateSubjectRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String description;
}
