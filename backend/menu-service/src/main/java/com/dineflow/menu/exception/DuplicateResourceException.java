package com.dineflow.menu.exception;

/** Thrown when creating a resource that conflicts with an existing one. Maps to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
