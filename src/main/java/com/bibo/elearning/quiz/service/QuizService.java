package com.bibo.elearning.quiz.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import com.bibo.elearning.quiz.entity.Quiz;
import com.bibo.elearning.quiz.entity.Question;
import com.bibo.elearning.quiz.entity.Choice;
import com.bibo.elearning.quiz.entity.QuizAttempt;
import com.bibo.elearning.quiz.dto.request.CreateQuizRequest;
import com.bibo.elearning.quiz.dto.request.SubmitQuizRequest;
import com.bibo.elearning.quiz.dto.response.QuizResponse;
import com.bibo.elearning.quiz.dto.response.QuizResultResponse;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.quiz.repository.QuizRepository;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.quiz.mapper.QuizMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final LessonRepository lessonRepository;
    private final QuizMapper quizMapper;
    
    public QuizResponse createQuiz(CreateQuizRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Quiz quiz = quizMapper.toEntity(request, lesson);

        List<Question> questions = request.getQuestions().stream().map(q -> {
            Question question = new Question();
            question.setQuestionText(q.getQuestionText());
            question.setQuiz(quiz);

            List<Choice> choices = q.getChoices().stream().map(c -> {
                Choice choice = new Choice();
                choice.setChoiceText(c.getChoiceText());
                choice.setCorrect(c.getCorrect());
                choice.setQuestion(question);
                return choice;
            }).toList();

            question.setChoices(choices);
            return question;
        }).toList();

        quiz.setQuestions(questions);
        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    public QuizResultResponse submitQuiz(SubmitQuizRequest request){
        Quiz quiz = quizRepository.findById(request.getQuizId())
        .orElseThrow(() -> new RuntimeException("Quiz not found."));

        int correct = 0;

        for(Question question : quiz.getQuestions()){
            Choice correctChoice = null;
            for(Choice choice : question.getChoices()){
                if(choice.isCorrect()){
                    correctChoice = choice;
                    break;
                }
            }

            if(correctChoice != null && request.getSelectedChoiceIds().contains(correctChoice.getId())){
                correct++;
            }
        }

        int total = quiz.getQuestions().size();
        int scorePercent = (int) ((correct / (double) total) * 100);
        boolean passed = scorePercent >= quiz.getPassingScore();

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setScore(scorePercent);
        attempt.setTotalItems(total);
        attempt.setPassed(passed);
        attempt.setAttemptedAt(LocalDateTime.now());

        quizAttemptRepository.save(attempt);
        return quizMapper.toResultResponse(attempt);
    }

    public List<QuizResponse> getQuizzesByLesson(Long lessonId) {
        return quizRepository.findByLessonIdWithQuestions(lessonId)
        .stream().map(quizMapper::toResponse).toList();
    }
}
