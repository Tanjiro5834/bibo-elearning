package com.bibo.elearning.quiz.dto.request;
public class CreateChoiceRequest {
    private String choiceText;
    private boolean correct;

    public String getChoiceText() {
        return choiceText;
    }

    public void setChoiceText(String choiceText) {
        this.choiceText = choiceText;
    }

    public boolean getCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }
}
