package com.bibo.elearning.ai.exception;

import org.springframework.http.HttpStatus;

/** AI errors with a kid-friendly message and the HTTP status the app should return. */
public class AiException extends RuntimeException {
    private final HttpStatus status;

    public AiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
