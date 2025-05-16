package com.example.exceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.Map;

@Provider
public class CustomExceptionMapper implements ExceptionMapper<CustomException> {

    @Override
    public Response toResponse(CustomException exception) {
        Response.Status status;
        Map<String, Object> entity;

        switch (exception.getErrorType()) {
            case NOT_FOUND:
                status = Response.Status.NOT_FOUND;
                entity = Map.of("message", exception.getMessage(), "code", exception.getErrorCode());
                break;
            case INVALID_INPUT:
                status = Response.Status.BAD_REQUEST;
                entity = Map.of("message", exception.getMessage(), "errors", exception.getErrors());
                break;
            case UNAUTHORIZED:
                status = Response.Status.UNAUTHORIZED;
                entity = Map.of("message", exception.getMessage(), "code", exception.getErrorCode());
                break;
            default:
                status = Response.Status.INTERNAL_SERVER_ERROR;
                entity = Map.of("message", "An unexpected error occurred", "code", "GEN-000");
                break;
        }

        return Response.status(status)
                .entity(entity)
                .build();
    }
}