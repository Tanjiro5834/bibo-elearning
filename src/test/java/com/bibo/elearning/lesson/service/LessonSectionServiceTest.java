package com.bibo.elearning.lesson.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.bibo.elearning.auth.common.enums.ContentType;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.LessonSection;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.lesson.repository.LessonSectionRepository;
import com.bibo.elearning.upload.ImageStorageService;

@ExtendWith(MockitoExtension.class)
class LessonSectionServiceTest {

    @Mock LessonSectionRepository sectionRepository;
    @Mock LessonRepository lessonRepository;
    @Mock ImageStorageService imageStorageService;
    @InjectMocks LessonSectionService service;

    private final Lesson lesson = Lesson.builder().id(1L).title("Fractions").build();

    private LessonSection section(long id, int order, ContentType type, String content) {
        LessonSection s = LessonSection.builder().id(id).lesson(lesson).contentOrder(order)
                .contentType(type).content(content).title("S" + id).build();
        lesson.getSections().add(s);
        return s;
    }

    @Test
    void reorder_rewritesOrdersInGivenSequence() {
        LessonSection a = section(10, 1, ContentType.TEXT, "a");
        LessonSection b = section(20, 2, ContentType.TEXT, "b");
        LessonSection c = section(30, 3, ContentType.TEXT, "c");
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));
        when(sectionRepository.findByLessonIdOrderByContentOrderAsc(1L)).thenReturn(List.of(a, b, c));

        service.reorderSections(1L, List.of(30L, 10L, 20L));

        assertThat(c.getContentOrder()).isEqualTo(1);
        assertThat(a.getContentOrder()).isEqualTo(2);
        assertThat(b.getContentOrder()).isEqualTo(3);
    }

    @Test
    void reorder_rejectsStaleOrForeignIds() {
        LessonSection a = section(10, 1, ContentType.TEXT, "a");
        LessonSection b = section(20, 2, ContentType.TEXT, "b");
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));
        when(sectionRepository.findByLessonIdOrderByContentOrderAsc(1L)).thenReturn(List.of(a, b));

        assertThatThrownBy(() -> service.reorderSections(1L, List.of(10L)))            // missing one
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.reorderSections(1L, List.of(10L, 99L)))       // not in lesson
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.reorderSections(1L, List.of(10L, 10L)))       // duplicate
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void delete_renumbersRemainingAndRemovesImage() {
        LessonSection img = section(10, 1, ContentType.IMAGE, "/uploads/images/x.png");
        LessonSection b = section(20, 2, ContentType.TEXT, "b");
        LessonSection c = section(30, 3, ContentType.TEXT, "c");
        when(sectionRepository.findById(10L)).thenReturn(Optional.of(img));
        when(sectionRepository.findByLessonIdOrderByContentOrderAsc(1L))
                .thenReturn(new ArrayList<>(List.of(b, c)));

        service.deleteSection(10L);

        verify(sectionRepository).delete(img);
        assertThat(b.getContentOrder()).isEqualTo(1);
        assertThat(c.getContentOrder()).isEqualTo(2);
        assertThat(lesson.getSections()).doesNotContain(img);
        verify(imageStorageService).deleteIfStored("/uploads/images/x.png");
    }
}
