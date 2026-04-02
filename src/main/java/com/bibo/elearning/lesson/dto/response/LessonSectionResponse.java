package com.bibo.elearning.lesson.dto.response;

import com.bibo.elearning.auth.common.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LessonSectionResponse {
    private Long id;
    private String title;
    private String content;
    private Integer contentOrder;
    private ContentType contentType;
}