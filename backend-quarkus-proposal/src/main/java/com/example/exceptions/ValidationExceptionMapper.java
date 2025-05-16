package com.example.exceptions;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.HashMap;
import java.util.Map;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {

    @Override
    public Response toResponse(ConstraintViolationException exception) {
        Map<String, String> errors = new HashMap<>();

        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String fieldName = getFieldName(violation.getPropertyPath());
            errors.put(fieldName, cleanMessage(violation.getMessage()));
        }

        return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                        "message", "Input data validation error",
                        "errors", errors
                ))
                .build();
    }

    private String getFieldName(Path propertyPath) {
        return propertyPath.toString()
                .replaceAll(".*\\.", ""); // Extrai o último segmento do caminho
    }

    private String cleanMessage(String message) {
        return message.replaceAll("\\{.*?\\}", "").trim();
    }
}