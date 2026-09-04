package com.dineflow.reservation.domain;

/** Thrown when a requested reservation does not exist. Maps to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
