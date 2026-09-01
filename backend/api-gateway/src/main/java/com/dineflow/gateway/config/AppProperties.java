package com.dineflow.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Gateway configuration: the single admin account and JWT signing settings. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Admin admin, Jwt jwt) {

    /** The one admin account. Password is stored as a BCrypt hash, never in plain text. */
    public record Admin(String username, String passwordHash) {
    }

    /** JWT signing settings. {@code secret} must be at least 32 characters (HS256). */
    public record Jwt(String secret, long expirationMinutes) {
    }
}
