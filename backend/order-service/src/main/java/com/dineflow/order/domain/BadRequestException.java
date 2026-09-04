package com.dineflow.order.domain;

/** Thrown for invalid order requests (e.g. missing table number, unavailable item). Maps to HTTP 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
