package com.dineflow.order.exception;

/** Thrown when a dependency (menu-service) cannot be reached. Maps to HTTP 502. */
public class UpstreamServiceException extends RuntimeException {

    public UpstreamServiceException(String message) {
        super(message);
    }
}
