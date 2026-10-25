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
import com.bibo.elearning.quiz.dto.response.QuizEditResponse;
import com.bibo.elearning.quiz.dto.request.CreateQuestionRequest;
import com.bibo.elearning.quiz.dto.request.CreateChoiceRequest;
import java.util.ArrayList;
import com.bibo.elearning.quiz.dto.response.QuizResultResponse;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.auth.user.repository.UserRepository;
import com.bibo.elearning.lesson.entity.Lesson;
import com.bibo.elearning.quiz.repository.QuizRepository;
import com.bibo.elearning.student.model.StudentProfile;
import com.bibo.elearning.student.repository.StudentProfileRepository;
import com.bibo.elearning.quiz.repository.QuizAttemptRepository;
import com.bibo.elearning.lesson.repository.LessonRepository;
import com.bibo.elearning.quiz.mapper.QuizMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.transaction.annotation.Transactional;
import com.bibo.elearning.quiz.dto.request.CheckAnswerRequest;
import com.bibo.elearning.quiz.dto.response.CheckAnswerResponse;
import com.bibo.elearning.quiz.repository.QuestionRepository;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final QuizMapper quizMapper;
    private final QuestionRepository questionRepository;
    
    public QuizResponse createQuiz(CreateQuizRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        validate(request);
        Quiz quiz = quizMapper.toEntity(request, lesson);
        quiz.setQuestions(buildQuestions(quiz, request.getQuestions()));
        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    public QuizResultResponse submitQuiz(String username, SubmitQuizRequest request){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found."));

        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
        .orElseThrow(() -> new RuntimeException("Student profile not found."));

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
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(scorePercent);
        attempt.setTotalItems(total);
        attempt.setPassed(passed);
        attempt.setAttemptedAt(LocalDateTime.now());

        quizAttemptRepository.save(attempt);
        return quizMapper.toResultResponse(attempt);
    }

    @Transactional(readOnly = true)
    public CheckAnswerResponse checkAnswer(CheckAnswerRequest req) {
        Question question = questionRepository.findById(req.questionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        boolean belongs = question.getChoices().stream()
                .anyMatch(c -> c.getId().equals(req.choiceId()));
        if (!belongs) throw new RuntimeException("Choice does not belong to this question");

        Choice correct = question.getChoices().stream()
                .filter(Choice::isCorrect)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question has no correct answer"));

        return new CheckAnswerResponse(correct.getId().equals(req.choiceId()), correct.getId());
    }

    public List<QuizResponse> getQuizzesByLesson(Long lessonId) {
        return quizRepository.findByLessonIdWithQuestions(lessonId)
        .stream().map(quizMapper::toResponse).toList();
    }

    // ── Edit / delete (ADMIN, TEACHER) ──

    @Transactional(readOnly = true)
    public QuizEditResponse getQuizForEdit(Long quizId) {
        Quiz quiz = findQuiz(quizId);
        List<QuizEditResponse.QuestionEdit> questions = quiz.getQuestions().stream()
                .map(q -> new QuizEditResponse.QuestionEdit(q.getQuestionText(),
                        q.getChoices().stream()
                                .map(c -> new QuizEditResponse.ChoiceEdit(c.getChoiceText(), c.isCorrect()))
                                .toList()))
                .toList();
        return new QuizEditResponse(quiz.getId(), quiz.getTitle(), quiz.getDescription(), quiz.getPassingScore(),
                quiz.getLesson() == null ? null : quiz.getLesson().getId(),
                quizAttemptRepository.countByQuizId(quizId), questions);
    }

    /**
     * Replaces the quiz details and its whole question set. Past attempts keep their
     * recorded score (attempts store only score/total, not individual answers).
     */
    @Transactional
    public QuizResponse updateQuiz(Long quizId, CreateQuizRequest request) {
        validate(request);
        Quiz quiz = findQuiz(quizId);
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setLesson(lesson);
        // Mutate the managed collection (orphanRemoval deletes the old questions + their choices)
        quiz.getQuestions().clear();
        quiz.getQuestions().addAll(buildQuestions(quiz, request.getQuestions()));

        // quiz is managed: dirty checking + cascade persist the new questions on flush.
        // (save() would merge and could duplicate the new children.)
        quizRepository.flush();
        return quizMapper.toResponse(quiz);
    }

    /** Refuses (409) when students already took it, unless {@code force} (admin) — which also erases attempts. */
    @Transactional
    public void deleteQuiz(Long quizId, boolean force) {
        Quiz quiz = findQuiz(quizId);
        long attempts = quizAttemptRepository.countByQuizId(quizId);
        if (attempts > 0 && !force) {
            throw new IllegalStateException(String.format(
                    "\"%s\" has already been taken %d time%s. Deleting it would erase those scores.",
                    quiz.getTitle(), attempts, attempts == 1 ? "" : "s"));
        }
        quizAttemptRepository.deleteByQuizId(quizId);
        quizRepository.delete(quiz); // cascades questions + choices
    }

    private Quiz findQuiz(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + quizId));
    }

    static void validate(CreateQuizRequest r) {
        if (r == null || r.getLessonId() == null) throw new IllegalArgumentException("Select a lesson");
        if (r.getTitle() == null || r.getTitle().isBlank()) throw new IllegalArgumentException("Quiz title is required");
        if (r.getPassingScore() < 0 || r.getPassingScore() > 100) {
            throw new IllegalArgumentException("Passing score must be between 0 and 100");
        }
        if (r.getQuestions() == null || r.getQuestions().isEmpty()) {
            throw new IllegalArgumentException("Add at least one question");
        }
        for (int i = 0; i < r.getQuestions().size(); i++) {
            CreateQuestionRequest q = r.getQuestions().get(i);
            int n = i + 1;
            if (q.getQuestionText() == null || q.getQuestionText().isBlank()) {
                throw new IllegalArgumentException("Question " + n + " text is required");
            }
            if (q.getChoices() == null || q.getChoices().size() < 2) {
                throw new IllegalArgumentException("Question " + n + " needs at least 2 choices");
            }
            if (q.getChoices().stream().anyMatch(c -> c.getChoiceText() == null || c.getChoiceText().isBlank())) {
                throw new IllegalArgumentException("Question " + n + " has an empty choice");
            }
            long correct = q.getChoices().stream().filter(CreateChoiceRequest::getCorrect).count();
            if (correct != 1) {
                throw new IllegalArgumentException("Question " + n + " must have exactly one correct answer");
            }
        }
    }

    private static List<Question> buildQuestions(Quiz quiz, List<CreateQuestionRequest> requests) {
        List<Question> questions = new ArrayList<>();
        for (CreateQuestionRequest q : requests) {
            Question question = new Question();
            question.setQuestionText(q.getQuestionText().trim());
            question.setQuiz(quiz);
            List<Choice> choices = new ArrayList<>();
            for (CreateChoiceRequest c : q.getChoices()) {
                Choice choice = new Choice();
                choice.setChoiceText(c.getChoiceText().trim());
                choice.setCorrect(c.getCorrect());
                choice.setQuestion(question);
                choices.add(choice);
            }
            question.setChoices(choices);
            questions.add(question);
        }
        return questions;
    }
}
