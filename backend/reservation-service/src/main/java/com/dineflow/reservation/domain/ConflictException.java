package com.dineflow.reservation.domain;

/**
 * Thrown when a request conflicts with existing state — e.g. a duplicate table label, or
 * deleting a table that still has active bookings. Maps to HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
