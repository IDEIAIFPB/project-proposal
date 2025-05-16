package com.example.exceptions;

import java.util.Map;

public class CustomException extends RuntimeException {

    public enum ErrorType {
        NOT_FOUND,
        INVALID_INPUT,
        UNAUTHORIZED,
        // Add other error types as needed
    }

    private final ErrorType errorType;
    private final String errorCode;
    private final Map<String, String> errors; // For validation errors (optional)

    public CustomException(String message, ErrorType errorType, String errorCode) {
        super(message);
        this.errorType = errorType;
        this.errorCode = errorCode;
        this.errors = null;
    }

    public CustomException(String message, ErrorType errorType, Map<String, String> errors) {
        super(message);
        this.errorType = errorType;
        this.errorCode = null;
        this.errors = errors;
    }

    public ErrorType getErrorType() {
        return errorType;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}