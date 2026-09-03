package com.dineflow.menu.exception;

/** Thrown when an uploaded photo is missing, too large, or not an accepted image type. Maps to HTTP 400. */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }
}
