package com.bibo.elearning.lesson.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.bibo.elearning.lesson.repository.LessonProgressRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.quiz.repository.QuizRepository;
import com.bibo.elearning.upload.ImageStorageService;

@ExtendWith(MockitoExtension.class)
class LessonServiceDeleteTest {

    @Mock LessonRepository lessonRepository;
    @Mock LessonProgressRepository lessonProgressRepository;
    @Mock QuizRepository quizRepository;
    @Mock QuizAttemptRepository quizAttemptRepository;
    @Mock ImageStorageService imageStorageService;
    @InjectMocks LessonService lessonService;

    private Lesson lessonWithImage() {
        Lesson lesson = Lesson.builder().id(7L).title("Fractions").build();
        lesson.getSections().add(LessonSection.builder()
                .contentType(ContentType.IMAGE).content("/uploads/images/abc.png").build());
        lesson.getSections().add(LessonSection.builder()
                .contentType(ContentType.TEXT).content("hello").build());
        return lesson;
    }

    @Test
    void refusesWhenStudentsHaveActivity_unlessForced() {
        when(lessonRepository.findById(7L)).thenReturn(Optional.of(lessonWithImage()));
        when(lessonProgressRepository.countByLessonId(7L)).thenReturn(2L);
        when(quizAttemptRepository.countByQuizLessonId(7L)).thenReturn(0L);

        assertThatThrownBy(() -> lessonService.deleteLesson(7L, false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("2 progress records");

        verify(lessonRepository, never()).delete(any());
        verify(imageStorageService, never()).deleteIfStored(any());
    }

    @Test
    void deletesEverythingAndCleansUpImages_whenNoActivity() {
        Lesson lesson = lessonWithImage();
        when(lessonRepository.findById(7L)).thenReturn(Optional.of(lesson));
        when(quizRepository.findByLessonId(7L)).thenReturn(List.of());

        lessonService.deleteLesson(7L, false);

        verify(lessonRepository).delete(lesson);
        verify(imageStorageService).deleteIfStored("/uploads/images/abc.png");
        verify(imageStorageService, never()).deleteIfStored("hello");
    }

    @Test
    void forceRemovesStudentHistoryFirst() {
        Lesson lesson = lessonWithImage();
        when(lessonRepository.findById(7L)).thenReturn(Optional.of(lesson));
        when(lessonProgressRepository.countByLessonId(7L)).thenReturn(3L);
        when(quizAttemptRepository.countByQuizLessonId(7L)).thenReturn(4L);
        when(quizRepository.findByLessonId(7L)).thenReturn(List.of());

        lessonService.deleteLesson(7L, true);

        verify(quizAttemptRepository).deleteByQuizLessonId(7L);
        verify(lessonProgressRepository).deleteByLessonId(7L);
        verify(lessonRepository).delete(lesson);
    }
}
