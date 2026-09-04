package com.dineflow.order.domain;

/** Thrown for invalid state changes (e.g. an illegal status transition). Maps to HTTP 409. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
