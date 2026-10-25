package com.bibo.elearning.lesson.dto.request;

import java.util.List;

/** Every section id of the lesson, in the new display order. */
public record ReorderSectionsRequest(List<Long> sectionIds) {}
