package com.bibo.elearning.lesson.dto.request;
import com.bibo.elearning.auth.common.enums.ContentType;
import lombok.Data;
@Data
public class CreateLessonSectionRequest {
    private Long lessonId;
    private String title;
    private String content;
    private Integer contentOrder;
    private ContentType contentType;
}
