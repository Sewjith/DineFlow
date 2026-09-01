package com.dineflow.reservation.exception;

/** Thrown when a requested reservation does not exist. Maps to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
