package com.dineflow.reservation.domain;

/** Thrown for invalid reservation input (e.g. a status that isn't confirm/cancel). Maps to HTTP 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
