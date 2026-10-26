package com.bibo.elearning.quiz.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.lesson.entity.Subject;
import com.bibo.elearning.quiz.dto.response.AvailableQuizResponse;
import com.bibo.elearning.quiz.entity.Question;
import com.bibo.elearning.quiz.entity.Quiz;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.quiz.repository.QuizRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;

@ExtendWith(MockitoExtension.class)
class QuizServiceAvailableTest {

    @Mock QuizRepository quizRepository;
    @Mock QuizAttemptRepository quizAttemptRepository;
    @Mock UserRepository userRepository;
    @Mock StudentProfileRepository studentProfileRepository;
    @InjectMocks QuizService quizService;

    private static Quiz quiz(long id, int questions) {
        Subject subject = new Subject();
        Lesson lesson = Lesson.builder().id(10L + id).title("Lesson " + id).subject(subject).published(true).build();
        Quiz q = new Quiz();
        q.setId(id);
        q.setTitle("Quiz " + id);
        q.setPassingScore(60);
        q.setLesson(lesson);
        List<Question> qs = new ArrayList<>();
        for (int i = 0; i < questions; i++) qs.add(new Question());
        q.setQuestions(qs);
        return q;
    }

    private static QuizAttempt attempt(Quiz quiz, int score, boolean passed) {
        QuizAttempt a = new QuizAttempt();
        a.setQuiz(quiz);
        a.setScore(score);
        a.setPassed(passed);
        return a;
    }

    @Test
    void listsEveryQuizWithTheStudentsOwnStatus() {
        User user = new User();
        user.setId(5L);
        StudentProfile profile = new StudentProfile();
        profile.setId(50L);
        when(userRepository.findByUsername("harry")).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(5L)).thenReturn(Optional.of(profile));

        Quiz first = quiz(1, 5), second = quiz(2, 3), empty = quiz(3, 0);
        when(quizRepository.findAvailableForStudents()).thenReturn(List.of(first, second, empty));
        when(quizAttemptRepository.findByStudentId(50L)).thenReturn(List.of(
                attempt(first, 40, false), attempt(first, 80, true)));

        List<AvailableQuizResponse> list = quizService.getAvailableQuizzes("harry");

        assertThat(list).extracting(AvailableQuizResponse::id).containsExactly(1L, 2L); // empty quiz hidden
        assertThat(list.get(0).attempts()).isEqualTo(2);
        assertThat(list.get(0).bestScore()).isEqualTo(80);
        assertThat(list.get(0).passed()).isTrue();
        assertThat(list.get(1).bestScore()).isNull();
        assertThat(list.get(1).questionCount()).isEqualTo(3);
    }
}
