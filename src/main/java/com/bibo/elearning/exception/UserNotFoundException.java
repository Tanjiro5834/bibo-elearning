package com.bibo.elearning.exception;

public class UserNotFoundException extends RuntimeException {
    
    private final String errorCode;
    private final String username;
    
    public UserNotFoundException(String username) {
        super(String.format("User not found: %s", username));
        this.errorCode = "USER_001";
        this.username = username;
    }
    
    public UserNotFoundException(String username, String errorCode) {
        super(String.format("User not found: %s", username));
        this.errorCode = errorCode;
        this.username = username;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getUsername() {
        return username;
    }
}
