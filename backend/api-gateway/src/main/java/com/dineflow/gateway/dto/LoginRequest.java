package com.dineflow.gateway.dto;

import jakarta.validation.constraints.NotBlank;

/** Admin login credentials. */
public record LoginRequest(
        @NotBlank(message = "username is required") String username,
        @NotBlank(message = "password is required") String password
) {
}
