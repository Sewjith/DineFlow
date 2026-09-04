package com.dineflow.gateway.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ServerWebExchange;

import java.util.LinkedHashMap;
import java.util.Map;

/** Turns login/validation errors into consistent {@link ErrorResponse} bodies. */
@RestControllerAdvice
public class GatewayExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex,
                                                                  ServerWebExchange exchange) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ErrorResponse body = ErrorResponse.of(
                status.value(), status.getReasonPhrase(), ex.getMessage(), path(exchange));
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ErrorResponse> handleValidation(WebExchangeBindException ex,
                                                          ServerWebExchange exchange) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ErrorResponse body = ErrorResponse.validation(
                status.value(), status.getReasonPhrase(),
                "Validation failed for one or more fields", path(exchange), fieldErrors);
        return ResponseEntity.status(status).body(body);
    }

    private String path(ServerWebExchange exchange) {
        return exchange.getRequest().getPath().value();
    }
}
