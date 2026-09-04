package com.dineflow.gateway.web;

/** Successful login result: the signed JWT and how to use it. */
public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        String username
) {
}
