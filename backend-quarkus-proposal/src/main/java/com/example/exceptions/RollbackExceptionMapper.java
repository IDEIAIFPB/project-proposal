package com.example.exceptions;

import jakarta.transaction.RollbackException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.validation.ConstraintViolationException;

import java.util.Map;
import java.util.stream.Collectors;

@Provider
public class RollbackExceptionMapper implements ExceptionMapper<RollbackException> {

    @Override
    public Response toResponse(RollbackException exception) {
        Throwable cause = exception.getCause();

        if (cause instanceof ConstraintViolationException cve) {
            Map<String, String> errors = cve.getConstraintViolations().stream()
                    .collect(Collectors.toMap(
                            v -> v.getPropertyPath().toString(),
                            v -> v.getMessage()
                    ));

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of(
                            "message", "Validation error during persistence",
                            "errors", errors
                    ))
                    .build();
        }

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("message", "Unexpected error in transaction"))
                .build();
    }
}