package com.dineflow.reservation.domain;

/** Thrown when no table is free for the requested time/party. Maps to HTTP 409. */
public class NoTableAvailableException extends RuntimeException {

    public NoTableAvailableException(String message) {
        super(message);
    }
}
