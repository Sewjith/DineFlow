package com.dineflow.menu.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Payload to create or update a category. */
public record CategoryRequest(
        @NotBlank(message = "name is required")
        @Size(max = 100, message = "name must be at most 100 characters")
        String name
) {
}
