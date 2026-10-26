package com.bibo.elearning.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import com.bibo.elearning.ai.exception.AiException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        return body(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleTooLarge(MaxUploadSizeExceededException ex) {
        return body(HttpStatus.valueOf(413), "Image is too large (max 5 MB)");
    }

    @ExceptionHandler(AiException.class)
    public ResponseEntity<Map<String, String>> handleAi(AiException ex) {
        return body(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return body(HttpStatus.CONFLICT, ex.getMessage());
    }

    // "error" kept for existing clients; "message" is what the SPAs read first.
    private static ResponseEntity<Map<String, String>> body(HttpStatus status, String msg) {
        String safe = msg == null ? status.getReasonPhrase() : msg;
        return ResponseEntity.status(status).body(Map.of("error", safe, "message", safe));
    }
}
