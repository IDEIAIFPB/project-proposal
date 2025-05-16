package com.example.exceptions;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.LocalDateTime;

@RegisterForReflection
public class ExceptionResponse {

    private LocalDateTime date;
    private String message;

    public ExceptionResponse() {}

    public ExceptionResponse(LocalDateTime date, String message) {
        this.date = date;
        this.message = message;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
