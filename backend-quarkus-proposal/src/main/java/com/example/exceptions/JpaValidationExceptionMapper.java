package com.example.exceptions;

import jakarta.persistence.PersistenceException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@Provider
public class JpaValidationExceptionMapper implements ExceptionMapper<PersistenceException> {

    @Override
    public Response toResponse(PersistenceException exception) {
        Throwable cause = exception.getCause();

        if (cause instanceof org.hibernate.exception.ConstraintViolationException hibernateEx) {
            return handleHibernateConstraintViolation(hibernateEx);
        }

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("message", "Unhandled persistence error"))
                .build();
    }

    private Response handleHibernateConstraintViolation(org.hibernate.exception.ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        String errorMessage = ex.getSQLException().getMessage();

        // Extrai detalhes específicos (exemplo para PostgreSQL)
        if (errorMessage.contains("violates check constraint")) {
            errors.put("constraint", extractConstraintName(errorMessage));
            errors.put("message", "violates check constraint");
        }

        return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                        "message", "Database validation error",
                        "errors", errors
                ))
                .build();
    }

    private String extractConstraintName(String message) {
        // Adapte conforme o formato da mensagem do seu banco
        return message.replaceAll(".*constraint \"(.*?)\".*", "$1");
    }
}