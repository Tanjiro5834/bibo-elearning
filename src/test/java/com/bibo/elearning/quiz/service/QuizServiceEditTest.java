package com.bibo.elearning.quiz.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
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
import com.bibo.elearning.quiz.dto.request.CreateChoiceRequest;
import com.bibo.elearning.quiz.dto.request.CreateQuestionRequest;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.entity.Quiz;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.quiz.repository.QuizRepository;

@ExtendWith(MockitoExtension.class)
class QuizServiceEditTest {

    @Mock QuizRepository quizRepository;
    @Mock QuizAttemptRepository quizAttemptRepository;
    @InjectMocks QuizService quizService;

    private static CreateChoiceRequest choice(String text, boolean correct) {
        CreateChoiceRequest c = new CreateChoiceRequest();
        c.setChoiceText(text);
        c.setCorrect(correct);
        return c;
    }

    private static CreateQuizRequest request(List<CreateChoiceRequest> choices) {
        CreateQuestionRequest q = new CreateQuestionRequest();
        q.setQuestionText("1/2 = ?");
        q.setChoices(choices);
        CreateQuizRequest r = new CreateQuizRequest();
        r.setLessonId(1L);
        r.setTitle("Fractions Quiz");
        r.setPassingScore(60);
        r.setQuestions(new ArrayList<>(List.of(q)));
        return r;
    }

    @Test
    void validate_acceptsOneCorrectAnswer() {
        assertThatCode(() -> QuizService.validate(request(List.of(choice("0.5", true), choice("2", false)))))
                .doesNotThrowAnyException();
    }

    @Test
    void validate_rejectsZeroOrMultipleCorrectAnswers() {
        assertThatThrownBy(() -> QuizService.validate(request(List.of(choice("a", false), choice("b", false)))))
                .hasMessageContaining("exactly one correct");
        assertThatThrownBy(() -> QuizService.validate(request(List.of(choice("a", true), choice("b", true)))))
                .hasMessageContaining("exactly one correct");
    }

    @Test
    void validate_rejectsBadPassingScoreAndBlankChoices() {
        CreateQuizRequest r = request(List.of(choice("a", true), choice("b", false)));
        r.setPassingScore(120);
        assertThatThrownBy(() -> QuizService.validate(r)).hasMessageContaining("between 0 and 100");

        assertThatThrownBy(() -> QuizService.validate(request(List.of(choice("a", true), choice(" ", false)))))
                .hasMessageContaining("empty choice");
    }

    @Test
    void delete_isBlockedWhenTaken_unlessForced() {
        Quiz quiz = new Quiz();
        quiz.setId(5L);
        quiz.setTitle("Fractions Quiz");
        when(quizRepository.findById(5L)).thenReturn(Optional.of(quiz));
        when(quizAttemptRepository.countByQuizId(5L)).thenReturn(3L);

        assertThatThrownBy(() -> quizService.deleteQuiz(5L, false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("taken 3 times");
        verify(quizRepository, never()).delete(any());

        quizService.deleteQuiz(5L, true);
        verify(quizAttemptRepository).deleteByQuizId(5L);
        verify(quizRepository).delete(quiz);
    }
}
