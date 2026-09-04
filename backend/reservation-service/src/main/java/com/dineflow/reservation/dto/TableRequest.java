package com.dineflow.reservation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Payload to create or update a restaurant table. */
public record TableRequest(
        @NotBlank(message = "label is required")
        @Size(max = 30, message = "label must be at most 30 characters")
        String label,

        @NotNull(message = "seats is required")
        @Min(value = 1, message = "seats must be at least 1")
        @Max(value = 50, message = "seats must be at most 50")
        Integer seats
) {
}
